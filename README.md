# Trivial API utilising graphology

## Use 
Invoke `node app.js` and send http requests to port 3000 as below.

### Create a route between places
POST /route/
```json
{"places": ["X1Y1", "X4Y6"], "time": 10, "cost": 50}
```

### Get the routes from a place
GET /route/:place/
```json
{"routes": [{"places": ["X1Y1", "X4Y6"], "time": 10, "cost": 50}]}
```

### Get all the routes
GET /route/
```json
{"routes": [{"route": ["X1Y1", "X4Y6"], "time": 10, "cost": 50}]}
```

### Get the route with the fewest stops from place to place and the total time and cost of the route
GET /route/:fromPlace/:toPlace"
```json
{"stops": 0, "cost": 50, "time": 10}
```
