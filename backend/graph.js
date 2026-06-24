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

function findDisconnectedGroups(edges) {
  const { adjacency, allNodes, parentNodes, childNodes } = buildGraph(edges);
  const roots = findRoots(allNodes, childNodes);
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

  for (const root of roots) {
    if (!visited.has(root)) {
      groups.push(bfs(root));
    }
  }

  // Handle cycles (nodes not visited)
  for (const node of allNodes) {
    if (!visited.has(node)) {
      const group = { nodes: [], edges: [] };
      const queue = [node];
      visited.add(node);

      while (queue.length > 0) {
        const current = queue.shift();
        group.nodes.push(current);

        for (const child of adjacency[current] || []) {
          group.edges.push({ parent: current, child });
          if (!visited.has(child)) {
            visited.add(child);
            queue.push(child);
          }
        }
      }

      groups.push(group);
    }
  }

  return groups;
}

module.exports = { buildGraph, findRoots, findDisconnectedGroups };
