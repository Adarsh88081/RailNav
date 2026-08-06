// server/services/graphService.js
// Core navigation engine. Nothing here is hardcoded per-station — it builds
// a graph purely from whatever Location/RouteEdge documents exist for the
// requested station, then runs BFS to find the shortest path by number of
// hops, using total distance as a tie-breaker.

const Location = require("../models/Location");
const RouteEdge = require("../models/RouteEdge");

// Average adult walking speed inside a busy station, used to estimate time.
const WALKING_SPEED_M_PER_MIN = 70; // ~4.2 km/h, slower than open-road pace due to crowds

/**
 * Build an adjacency list for a station:
 * { [locationId]: [ { to, distanceMeters, instruction, edgeId }, ... ] }
 */
const buildGraph = async (stationId) => {
  const edges = await RouteEdge.find({ station: stationId }).lean();

  const graph = {};
  const addEdge = (from, to, distanceMeters, instruction) => {
    const key = String(from);
    if (!graph[key]) graph[key] = [];
    graph[key].push({ to: String(to), distanceMeters, instruction });
  };

  edges.forEach((edge) => {
    addEdge(edge.from, edge.to, edge.distanceMeters, edge.instruction);
    if (edge.bidirectional) {
      addEdge(edge.to, edge.from, edge.distanceMeters, `Head back: ${edge.instruction}`);
    }
  });

  return graph;
};

/**
 * BFS shortest path (fewest hops) between two location IDs within a station's graph.
 * Returns null if no path exists, otherwise an array of step objects.
 */
const findShortestPath = async (stationId, fromLocationId, toLocationId) => {
  if (String(fromLocationId) === String(toLocationId)) {
    return { steps: [], totalDistance: 0 };
  }

  const graph = await buildGraph(stationId);

  const startKey = String(fromLocationId);
  const targetKey = String(toLocationId);

  const queue = [startKey];
  const visited = new Set([startKey]);
  // predecessor map: key -> { from, edge }
  const cameFrom = {};

  let found = false;

  while (queue.length > 0) {
    const current = queue.shift();

    if (current === targetKey) {
      found = true;
      break;
    }

    const neighbours = graph[current] || [];
    for (const edge of neighbours) {
      if (!visited.has(edge.to)) {
        visited.add(edge.to);
        cameFrom[edge.to] = { from: current, edge };
        queue.push(edge.to);
      }
    }
  }

  if (!found) return null;

  // Walk backwards from target to start to reconstruct the path
  const pathEdges = [];
  let cursor = targetKey;
  while (cursor !== startKey) {
    const step = cameFrom[cursor];
    pathEdges.unshift(step.edge);
    cursor = step.from;
  }

  const totalDistance = pathEdges.reduce((sum, e) => sum + e.distanceMeters, 0);

  return { steps: pathEdges, totalDistance };
};

/**
 * High-level helper used by the controller: resolves location names to IDs,
 * runs BFS, and formats a full navigation response.
 */
const getRouteBetween = async (stationId, fromName, toName) => {
  const [fromLoc, toLoc] = await Promise.all([
    Location.findOne({ station: stationId, name: fromName }),
    Location.findOne({ station: stationId, name: toName }),
  ]);

  if (!fromLoc) throw new Error(`Unknown current location: "${fromName}"`);
  if (!toLoc) throw new Error(`Unknown destination: "${toName}"`);

  const result = await findShortestPath(stationId, fromLoc._id, toLoc._id);

  if (!result) {
    const err = new Error("No walkable route found between these two points");
    err.statusCode = 404;
    throw err;
  }

  // Build a lookup so we can attach human-readable location names to each step
  const allLocationIds = new Set();
  result.steps.forEach((s) => allLocationIds.add(s.to));
  allLocationIds.add(String(fromLoc._id));

  const locationsById = {};
  const locs = await Location.find({ _id: { $in: Array.from(allLocationIds) } }).lean();
  locs.forEach((l) => (locationsById[String(l._id)] = l));

  let runningLocation = fromLoc._id;
  const navigation = result.steps.map((step, index) => {
    const arrivedAt = locationsById[step.to];
    return {
      stepNumber: index + 1,
      instruction: step.instruction,
      distanceMeters: step.distanceMeters,
      arrivesAt: arrivedAt ? arrivedAt.name : null,
    };
  });

  navigation.push({
    stepNumber: navigation.length + 1,
    instruction: "Destination reached",
    distanceMeters: 0,
    arrivesAt: toLoc.name,
  });

  const estimatedMinutes = Math.max(1, Math.round(result.totalDistance / WALKING_SPEED_M_PER_MIN));

  return {
    from: fromLoc.name,
    to: toLoc.name,
    totalDistanceMeters: result.totalDistance,
    estimatedTimeMinutes: estimatedMinutes,
    navigation,
  };
};

module.exports = { buildGraph, findShortestPath, getRouteBetween };
