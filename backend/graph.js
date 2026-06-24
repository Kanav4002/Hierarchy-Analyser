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

function detectCycle(adjacency, nodes) {
  const visited = new Set();
  const recStack = new Set();

  function dfs(node) {
    visited.add(node);
    recStack.add(node);

    for (const child of adjacency[node] || []) {
      if (!visited.has(child)) {
        if (dfs(child)) return true;
      } else if (recStack.has(child)) {
        return true;
      }
    }

    recStack.delete(node);
    return false;
  }

  for (const node of nodes) {
    if (!visited.has(node)) {
      if (dfs(node)) return true;
    }
  }

  return false;
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

  const allRoots = findRoots(allNodes, childNodes);

  for (const root of allRoots) {
    if (!visited.has(root)) {
      groups.push(bfs(root));
    }
  }

  for (const node of [...allNodes].sort()) {
    if (!visited.has(node)) {
      groups.push(bfs(node));
    }
  }

  for (const group of groups) {
    group.roots = findGroupRoots(group.nodes, childNodes);
    group.has_cycle = detectCycle(adjacency, group.nodes);
  }

  return groups;
}

function calculateDepth(edges, root) {
  function getMaxDepth(node) {
    const children = edges
      .filter((e) => e.parent === node)
      .map((e) => e.child);

    if (children.length === 0) return 1;

    const childDepths = children.map((child) => getMaxDepth(child));
    return 1 + Math.max(...childDepths);
  }

  return getMaxDepth(root);
}

function buildTree(edges, root) {
  function addNode(node) {
    const children = edges
      .filter((e) => e.parent === node)
      .map((e) => e.child);

    if (children.length === 0) return {};

    const result = {};
    for (const child of children) {
      result[child] = addNode(child);
    }
    return result;
  }

  return { [root]: addNode(root) };
}

module.exports = { buildGraph, findRoots, findGroupRoots, detectCycle, findDisconnectedGroups, buildTree, calculateDepth };
