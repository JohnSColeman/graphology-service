let Graph = require('graphology');
let path = require('graphology-shortest-path');
let express = require('express');
let app = express();
app.use(express.json());

// useful data structure for representing undirected graph data that has nodes and edges
// we can also serialize and deserialize this object to persist it into a file
// if we want to scale up the service we could store the data in a graph database instead
const graph = new Graph({type: 'undirected'});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});

/**
 * Create a route between places with the given travel time and cost.
 * eg request body: {"places": ["A", "B"], "time": 1, "cost": 5}
 * return 200 for success or 400 if route already exists
 */
app.post("/route/", (req, res) => {
    const route = req.body
    const fromPlace = route.places[0]
    const toPlace = route.places[1]
    if (!graph.hasEdge(fromPlace, toPlace)) {
        if (!graph.hasNode(fromPlace)) {
            graph.addNode(fromPlace);
        }
        if (!graph.hasNode(toPlace)) {
            graph.addNode(toPlace);
        }
        const edge = graph.addEdge(fromPlace, toPlace);
        graph.setEdgeAttribute(edge, 'time', route.time);
        graph.setEdgeAttribute(edge, 'cost', route.cost);
        res.sendStatus(200);
    } else {
        res.sendStatus(400);
    }
    console.log('Number of nodes', graph.order);
    console.log('Number of edges', graph.size);
});

/**
 * Gets the routes from the given place
 * return the places routes for success or 404 if the place does not exist
 */
app.get("/route/:place", (req, res) => {
    const place = req.params.place;
    if (graph.hasNode(place)) {
        const routes = []
        graph.forEachEdge(place, (_, attributes, source, target) => {
            routes.push({ places: [source, target], ...attributes })
        });
        res.json({ routes: routes });
    } else {
        res.sendStatus(404);
    }
});

/**
 * Gets all the routes.
 */
app.get("/route", (_req, res) => {
    const routes = graph.mapEdges((_, attributes, source, target) => {
        return { route: [source, target], ...attributes }});
    res.json({ routes: routes });
});

/**
 * Gets the shortest route between the given from place and to place parameters.
 * returns the shortest route for success or 404 if the route is invalid
 */
app.get("/route/:fromPlace/:toPlace", (req, res) => {
    const fromPlace = req.params.fromPlace;
    const toPlace = req.params.toPlace;
    try {
        const places = path.bidirectional(graph, fromPlace, toPlace);
        const edges = [];
        for (let i = 1; i < places.length; i++) {
            edges.push({ from: places[i - 1], to: places[i] });
        }
        const trip = edges.reduce((product, elem) => {
            let edgeAttributes = null;
            graph.forEachEdge(elem.from, elem.to, (_, attributes) => {
                edgeAttributes = attributes
            });
            return { cost: (product.cost + edgeAttributes.cost), time: (product.time + edgeAttributes.time) }
        }, { cost: 0, time: 0 });
        res.json({ stops: (places.length - 2), ...trip });
    } catch {
        res.sendStatus(404); // this is not very cool bc it will catch and hide any kind of errors
    }
});

