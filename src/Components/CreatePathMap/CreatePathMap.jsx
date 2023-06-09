import { Draw, Select, Snap } from 'ol/interaction';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { useEffect, useState } from 'react';
import {
  setPointStyle, pointToCoordinates, coordinatesToPoint, stringToPolyline, setPathStyle,
} from '../../Utility/map';
import pathAPIService from '../../Services/graphhopper';
import MapComponent from '../MapComponent/MapComponent';
import PathInfo from '../PathInfo/PathInfo';

let stops;
let origin; let destination; let pointType;

// layer for origin and destination
const endpointsVecSource = new VectorSource();
const endpointsVecLayer = new VectorLayer({
  source: endpointsVecSource,
  style: setPointStyle,
});

const stopsVecSource = new VectorSource();
const stopsVecLayer = new VectorLayer({
  source: stopsVecSource,
  style: setPointStyle,
});

const pathVecSource = new VectorSource();
const pathVecLayer = new VectorLayer({
  source: pathVecSource,
  style: setPathStyle,
});

const drawAction = new Draw({
  source: stopsVecSource,
  type: 'Point',
});

const snapAction = new Snap({
  source: stopsVecSource,
});

const deleteAction = new Select({
  layers: [stopsVecLayer],
});

function CreatePathMap({ route, setNavigationResult, setStops }) {
  const [time, setTime] = useState();
  const [distance, setDistance] = useState();
  const [focusExtent, setFocusExtent] = useState();
  const [deleteMode, setDeleteMode] = useState();

  const clearPath = () => {
    setTime(null);
    setDistance(null);
    pathVecSource.clear();
  };

  const drawPath = async () => {
    const points = [];

    points.push(pointToCoordinates(origin));
    stops.forEach((stop) => points.push(pointToCoordinates(stop)));
    points.push(pointToCoordinates(destination));

    const result = await pathAPIService.getPath(points);
    const pathFeature = stringToPolyline(result.paths[0].points);

    // delete previous path if any
    clearPath();
    pathVecSource.addFeature(pathFeature);
    setTime(result.paths[0].time);
    setDistance(result.paths[0].distance);

    setNavigationResult(result);
  };

  const clearStops = () => {
    stops = [];
    stopsVecSource.clear();
    drawPath();
    setStops(stops);
  };

  const changePointType = (type) => {
    pointType = type;

    drawAction.setActive(false);
    deleteAction.setActive(false);

    if (pointType === 'delete') {
      deleteAction.setActive(true);
    } else {
      deleteAction.getFeatures().clear();
    }

    if (pointType === 'stop') {
      drawAction.setActive(true);
    }

    setDeleteMode(deleteAction.getActive());
  };

  const handleDrawAction = (event) => {
    const point = event.feature;
    point.type = pointType;

    const input = window.prompt('Enter a name for the point');
    point.name = input || pointType;

    stops.push(point);
    setStops(stops);

    drawPath();
  };

  const handleDeleteAction = (event) => {
    const feature = event.selected[0];

    stopsVecSource.removeFeature(feature);
    stops = stops.filter((stop) => stop !== feature);
    setStops(stops);
    console.log(stops);

    drawPath();
  };

  useEffect(() => {
    drawAction.on('drawstart', handleDrawAction);
    deleteAction.on('select', handleDeleteAction);
    changePointType('none');

    // deconstructor
    return () => {
      drawAction.un('drawstart', handleDrawAction);
      deleteAction.un('select', handleDeleteAction);
    };
  }, []);

  useEffect(() => {
    // add origin and destination
    if (!route) {
      return;
    }

    origin = coordinatesToPoint([route.source_latitude, route.source_longitude]);
    origin.name = route.source;
    origin.type = 'origin';

    destination = coordinatesToPoint([route.destination_latitude, route.destination_longitude]);
    destination.name = route.destination;
    destination.type = 'destination';
    stops = [];

    const features = [origin, destination];
    features.forEach((p) => setPointStyle(p));
    endpointsVecSource.addFeatures(features);

    drawPath().then(() => setFocusExtent(pathVecSource.getExtent()));
  }, [route]);

  return (
    <>
      <MapComponent
        layers={[pathVecLayer, stopsVecLayer, endpointsVecLayer]}
        interactions={[drawAction, snapAction, deleteAction]}
        focusExtent={focusExtent}
      />
      <PathInfo time={time} distance={distance} />
      <div className="d-flex justify-content-between mt-3">
        <div>
          <button onClick={() => changePointType('stop')} className="btn btn-outline-primary">Add Stop</button>
          <button onClick={() => changePointType('none')} className="btn btn-outline-secondary">None</button>
        </div>
        <div>
          <button onClick={() => changePointType('delete')} className={`btn btn-danger h-100 mx-1 ${deleteMode && 'bg-white text-danger'}`}>Delete a Point</button>
          <button className="btn btn-danger h-100" onClick={clearStops}>Clear All</button>
        </div>
      </div>
    </>
  );
}

export default CreatePathMap;
