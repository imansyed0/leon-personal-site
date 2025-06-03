/* global L */
import React from "react";
import { flushSync } from "react-dom";
import { Portal } from "react-portal";
import { bindActionCreators } from "redux";
import "leaflet";

import { connect } from "react-redux";
import * as selectors from "../../../selectors";
import * as actions from "../../../actions";

import Sites from "./atoms/Sites";
import Regions from "./atoms/Regions";
import Narratives from "./atoms/Narratives";
import DefsMarkers from "./atoms/DefsMarkers";
import SatelliteOverlayToggle from "./atoms/SatelliteOverlayToggle";
import LoadingOverlay from "../../atoms/Loading";

import {
  isIdentical,
} from "../../../common/utilities";

// NB: important constants for map, TODO: make statics
// Note: Base map is OpenStreetMaps by default; can choose another base map
const supportedMapboxMap = ["streets-v11", "satellite"];
const defaultToken = "your_token";

class Map extends React.Component {
  constructor() {
    super();
    this.projectPoint = this.projectPoint.bind(this);
    this.svgRef = React.createRef();
    this.map = null;
    this.tileLayer = null;
    this.state = {
      mapTransformX: 0,
      mapTransformY: 0,
      currentZoom: 0
    };
    this.styleLocation = this.styleLocation.bind(this);
  }

  componentDidMount() {
    if (this.map === null) {
      this.initializeMap();
      this.initializeTileLayer();
    }
    window.dispatchEvent(new Event("resize"));
  }

  componentDidUpdate(prevProps) {
    if (prevProps.ui.tiles !== this.props.ui.tiles && this.map) {
      this.initializeTileLayer();
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    // Set appropriate zoom for narrative
    const { bounds } = nextProps.app.map;
    if (!isIdentical(bounds, this.props.app.map.bounds) && bounds !== null) {
      this.map.fitBounds(bounds);
    } else {
      if (!isIdentical(nextProps.app.selected, this.props.app.selected)) {
        console.log('Selected events changed:', nextProps.app.selected);
        // Fly to first of events selected
        const eventPoint =
          nextProps.app.selected.length > 0 ? nextProps.app.selected[0] : null;

        console.log('Event point to zoom to:', eventPoint);

        if (
          eventPoint !== null &&
          eventPoint.latitude &&
          eventPoint.longitude
        ) {
          console.log('Zooming to:', eventPoint.latitude, eventPoint.longitude);
          this.map.setView(
            [eventPoint.latitude, eventPoint.longitude],
            Math.max(this.map.getZoom(), 16), // Ensure minimum zoom level of 16 for significant zoom
            {
              animate: true,
              pan: {
                duration: 0.7,
              },
            }
          );
        }
      }
    }
  }

  getTileUrl(tiles) {
    if (
      tiles === "openstreetmap" ||
      !process.env.MAPBOX_TOKEN ||
      process.env.MAPBOX_TOKEN === defaultToken
    ) {
      return "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
    }

    if (supportedMapboxMap.indexOf(this.props.ui.tiles) !== -1) {
      return `https://api.mapbox.com/styles/v1/mapbox/${this.props.ui.tiles}/tiles/{z}/{x}/{y}?access_token=${process.env.MAPBOX_TOKEN}`;
    }

    return `https://api.mapbox.com/styles/v1/mapbox/${supportedMapboxMap[0]}/tiles/{z}/{x}/{y}?access_token=${process.env.MAPBOX_TOKEN}`;
  }

  initializeTileLayer() {
    if (!this.map) {
      return;
    }

    const url = this.getTileUrl(this.props.ui.tiles);
    if (this.tileLayer) {
      this.tileLayer.setUrl(url);
    } else {
      this.tileLayer = L.tileLayer(url);
      this.tileLayer.addTo(this.map);
    }
  }

  initializeMap() {
    const { map: mapConfig } = this.props.app;

    const map = L.map(this.props.ui.dom.map)
      .setView(mapConfig.anchor, mapConfig.startZoom)
      .setMinZoom(mapConfig.minZoom)
      .setMaxZoom(mapConfig.maxZoom)
      .setMaxBounds(mapConfig.maxBounds);

    map.keyboard.disable();
    map.zoomControl.remove();

    map.on("moveend", () => {
      this.alignLayers();
    });

    map.on("zoomend viewreset", () => {
      this.map.dragging.enable();
      this.map.doubleClickZoom.enable();
      this.map.scrollWheelZoom.enable();
      flushSync(() => {
        this.alignLayers();
        this.setState({ currentZoom: this.map.getZoom() });
      });
    });
    
    map.on("zoomstart", () => {
      if (this.svgRef.current !== null)
        this.svgRef.current.classList.add("hide");
    });
    
    map.on("zoomend", () => {
      if (this.svgRef.current !== null)
        this.svgRef.current.classList.remove("hide");
    });
    
    window.addEventListener("resize", () => {
      this.alignLayers();
    });

    this.map = map;
    this.setState({ currentZoom: map.getZoom() });
  }

  alignLayers() {
    const mapNode = document.querySelector(".leaflet-map-pane");
    if (mapNode === null) return { transformX: 0, transformY: 0 };

    const transform = window
      .getComputedStyle(mapNode)
      .getPropertyValue("transform");

    this.setState({
      mapTransformX: +transform.split(",")[4],
      mapTransformY: +transform.split(",")[5].split(")")[0],
    });
  }

  projectPoint(location) {
    const latLng = new L.LatLng(location[0], location[1]);
    return {
      x: this.map.latLngToLayerPoint(latLng).x + this.state.mapTransformX,
      y: this.map.latLngToLayerPoint(latLng).y + this.state.mapTransformY,
    };
  }

  getClientDims() {
    const boundingClient = document
      .querySelector(`#${this.props.ui.dom.map}`)
      .getBoundingClientRect();

    return {
      width: boundingClient.width,
      height: boundingClient.height,
    };
  }

  renderTiles() {
    const pane = this.map.getPanes().overlayPane;
    const { width, height } = this.getClientDims();

    return this.map ? (
      <Portal node={pane}>
        <svg
          ref={this.svgRef}
          width={width}
          height={height}
          style={{
            transform: `translate3d(${-this.state.mapTransformX}px, ${-this.state.mapTransformY}px, 0)`,
          }}
          className="leaflet-svg"
        />
      </Portal>
    ) : null;
  }

  renderSites() {
    return (
      <Sites
        sites={this.props.domain.sites}
        projectPoint={this.projectPoint}
        isEnabled={this.props.app.views.sites}
      />
    );
  }

  renderRegions() {
    return (
      <Regions
        svg={this.svgRef.current}
        regions={this.props.domain.regions}
        projectPoint={this.projectPoint}
        styles={this.props.ui.regions}
      />
    );
  }

  renderNarratives() {
    const hasNarratives = this.props.domain.narratives.length > 0;
    return (
      <Narratives
        svg={this.svgRef.current}
        narratives={
          hasNarratives
            ? this.props.domain.narratives
            : [this.props.app.narrative]
        }
        projectPoint={this.projectPoint}
        narrative={this.props.app.narrative}
        styles={this.props.ui.narratives}
        onSelectNarrative={this.props.methods.onSelectNarrative}
        features={this.props.features}
      />
    );
  }

  styleLocation(location) {
    return [null, null];
  }

  renderCategoryIcon(event, x, y, useClusterMode = false) {
    const zoomLevel = this.state.currentZoom;
    
    // Show clusters (red circles) below zoom level 8, individual icons above
    if (useClusterMode || zoomLevel < 13) {
      return (
        <g key={`cluster-${event.id}`}>
          <circle 
            cx={x} 
            cy={y} 
            r="12" 
            fill="#dc3545"
            stroke="none"
            opacity="0.8"
            className="cluster-marker"
          />
        </g>
      );
    }
    
    // Find the first category association (has mode: "CATEGORY" and id starts with 'c')
    const categoryAssoc = event.associations ? event.associations.find(a => 
      a.mode === "CATEGORY" && a.id.startsWith('c')
    ) : null;
    
    if (!categoryAssoc) return null;

    const imagePath = `/images/${categoryAssoc.id}.svg`;

    // Calculate icon size based on zoom level
    const baseSize = 40;
    
    // Scale factor: starts at 0.8 at low zoom, reaches 1.2 at high zoom
    // Clamp between reasonable limits to keep it looking good
    const minScale = 0.7;
    const maxScale = 1.4;
    const zoomScale = Math.min(maxScale, Math.max(minScale, 0.6 + (zoomLevel * 0.08)));
    
    const iconSize = Math.round(baseSize * zoomScale);
    const offset = iconSize / 2;

    return (
      <g key={`event-${event.id}`}>
        {/* SVG Icon */}
        <image
          href={imagePath}
          x={x - offset}
          y={y - offset}
          width={iconSize}
          height={iconSize}
          className="event-icon"
        />
        {/* Fallback circle if SVG doesn't load */}
        <circle 
          cx={x} 
          cy={y} 
          r={offset * 0.6} 
          fill="#666"
          stroke="#fff"
          strokeWidth="2"
          opacity="0.8"
          style={{ display: 'none' }}
          className="event-fallback"
        />
      </g>
    );
  }

  handleEventClick = (e, event) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('=== EVENT CLICKED ===');
    console.log('Event clicked:', event);
    console.log('Event ID:', event.id);
    console.log('Methods prop:', this.props.methods);
    console.log('Actions prop:', this.props.actions);
    
    // Try using methods first, fallback to actions
    if (this.props.methods && this.props.methods.onSelect) {
      console.log('Using methods.onSelect');
      this.props.methods.onSelect([event]);
    } else if (this.props.actions && this.props.actions.updateSelected) {
      console.log('Using actions.updateSelected as fallback');
      this.props.actions.updateSelected([event]);
    } else {
      console.error('No selection method available');
    }
  }

  renderEvents() {
    if (!this.props.domain.events || !this.svgRef.current) {
      return null;
    }

    const events = this.props.domain.events.filter(
      event => event.latitude && event.longitude
    );

    const zoomLevel = this.state.currentZoom;
    console.log('Current zoom level:', zoomLevel);

    // Group events by location at low zoom levels for clustering
    const eventGroups = {};
    if (zoomLevel < 8) {
      events.forEach(event => {
        // Round coordinates to group nearby events
        const lat = Math.round(event.latitude * 1000) / 1000;
        const lng = Math.round(event.longitude * 1000) / 1000;
        const key = `${lat},${lng}`;
        
        if (!eventGroups[key]) {
          eventGroups[key] = [];
        }
        eventGroups[key].push(event);
      });
    }

    const renderedEvents = events.map(event => {
      const { x, y } = this.projectPoint([event.latitude, event.longitude]);
      
      const isSelected = this.props.app.selected.some(
        selected => selected.id === event.id
      );

      // Determine if this event should use cluster mode
      let useClusterMode = false;
      if (zoomLevel < 8) {
        const lat = Math.round(event.latitude * 1000) / 1000;
        const lng = Math.round(event.longitude * 1000) / 1000;
        const key = `${lat},${lng}`;
        useClusterMode = eventGroups[key] && eventGroups[key].length > 1;
      }

      return (
        <g 
          key={event.id}
          className={`event-point ${isSelected ? 'selected' : ''} ${useClusterMode ? 'clustered' : 'individual'}`}
        >
          {this.renderCategoryIcon(event, x, y, useClusterMode)}
          {/* Larger invisible click area */}
          <circle
            cx={x}
            cy={y}
            r="20"
            fill="transparent"
            stroke="none"
            style={{ 
              cursor: 'pointer',
              pointerEvents: 'all'
            }}
            onClick={(e) => this.handleEventClick(e, event)}
          />
          {isSelected && (
            <circle
              className="event-hover"
              cx={x}
              cy={y}
              r="16"
              stroke="#fff"
              strokeWidth="3"
              fill="none"
              opacity="0.8"
              style={{ pointerEvents: 'none' }}
            />
          )}
        </g>
      );
    });

    return (
      <Portal node={this.svgRef.current}>
        <g className="event-points">
          {renderedEvents}
        </g>
      </Portal>
    );
  }

  renderMarkers() {
    return (
      <Portal node={this.svgRef.current}>
        <DefsMarkers />
      </Portal>
    );
  }

  render() {
    const { isShowingSites, isFetchingDomain } = this.props.app.flags;
    const classes = this.props.app.narrative
      ? "map-wrapper narrative-mode"
      : "map-wrapper";
    const innerMap = this.map ? (
      <>
        {this.renderTiles()}
        {this.renderMarkers()}
        {isShowingSites ? this.renderSites() : null}
        {this.renderRegions()}
        {this.renderNarratives()}
        {this.renderEvents()}
      </>
    ) : null;

    return (
      <div className={classes} onKeyDown={this.props.onKeyDown} tabIndex="0">
        <div id={this.props.ui.dom.map} />
        <LoadingOverlay
          isLoading={this.props.app.loading || isFetchingDomain}
          ui={isFetchingDomain}
          language={this.props.app.language}
        />
        {this.props.features.USE_SATELLITE_OVERLAY_TOGGLE && (
          <SatelliteOverlayToggle
            isUsingSatellite={this.props.ui.tiles === "satellite"}
            toggleView={this.props.actions.toggleSatelliteView}
          />
        )}
        {innerMap}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    domain: {
      locations: selectors.selectLocations(state),
      narratives: selectors.selectNarratives(state),
      categories: selectors.getCategories(state),
      sites: selectors.selectSites(state),
      regions: selectors.selectRegions(state),
      events: selectors.selectEvents(state),
    },
    app: {
      views: state.app.associations.views,
      selected: selectors.selectSelected(state),
      highlighted: state.app.highlighted,
      map: state.app.map,
      language: state.app.language,
      loading: state.app.loading,
      narrative: state.app.associations.narrative,
      coloringSet: state.app.associations.coloringSet,
      flags: {
        isShowingSites: state.app.flags.isShowingSites,
        isFetchingDomain: state.app.flags.isFetchingDomain,
      },
    },
    ui: {
      tiles: selectors.getTiles(state),
      dom: state.ui.dom,
      narratives: state.ui.style.narratives,
      mapSelectedEvents: state.ui.style.selectedEvents,
      regions: state.ui.style.regions,
      eventRadius: state.ui.eventRadius,
      filterColors: state.ui.coloring.colors,
    },
    features: selectors.getFeatures(state),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(actions, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Map);
