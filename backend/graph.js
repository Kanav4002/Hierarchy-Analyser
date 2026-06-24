function buildGraph(edges) {
  const adjacency = {};
  const allNodes = new Set();
  const parentNodes = new Set();
  const childNodes = new Set();

  for (const { parent, child } of edges) {
    allNodes.add(parent);
    allNodes.add(child);
    parentNodes.add(parent);
    childNodes.add(child);

    if (!adjacency[parent]) {
      adjacency[parent] = [];
    }
    adjacency[parent].push(child);
  }

  return { adjacency, allNodes, parentNodes, childNodes };
}

function findRoots(allNodes, childNodes) {
  return [...allNodes].filter((node) => !childNodes.has(node));
}

function findGroupRoots(groupNodes, childNodes) {
  const roots = groupNodes.filter((node) => !childNodes.has(node));

  if (roots.length === 0) {
    return [groupNodes.sort()[0]];
  }

  return roots;
}

function findDisconnectedGroups(edges) {
  const { adjacency, allNodes, parentNodes, childNodes } = buildGraph(edges);
  const visited = new Set();
  const groups = [];

  function bfs(start) {
    const group = { nodes: [], edges: [] };
    const queue = [start];
    visited.add(start);

    while (queue.length > 0) {
      const node = queue.shift();
      group.nodes.push(node);

      for (const child of adjacency[node] || []) {
        group.edges.push({ parent: node, child });
        if (!visited.has(child)) {
          visited.add(child);
          queue.push(child);
        }
      }
    }

    return group;
  }

  // Find all roots first
  const allRoots = findRoots(allNodes, childNodes);

  // Start BFS from each root
  for (const root of allRoots) {
    if (!visited.has(root)) {
      groups.push(bfs(root));
    }
  }

  // Handle cycles (nodes not visited)
  for (const node of [...allNodes].sort()) {
    if (!visited.has(node)) {
      groups.push(bfs(node));
    }
  }

  // Add root to each group
  for (const group of groups) {
    group.roots = findGroupRoots(group.nodes, childNodes);
  }

  return groups;
}

module.exports = { buildGraph, findRoots, findGroupRoots, findDisconnectedGroups };
