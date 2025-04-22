module.exports = {
  title: 'guapinol timemap',
  display_title: 'guapinol timemap',
  SERVER_ROOT: '',
  EVENTS_EXT: '/api/timemap_data/export_events/deeprows',
  ASSOCIATIONS_EXT: '/api/timemap_data/export_associations/deeprows',
  SOURCES_EXT: '/api/timemap_data/export_sources/deepids',
  SITES_EXT: '',
  SHAPES_EXT: '',
  DATE_FMT: 'MM/DD/YYYY',
  TIME_FMT: 'hh:mm',
  store: {
    app: {
      map: {
        anchor: [15.6662, -86.0000],
        // startZoom: 11
      }
    },
    features: {
      COLOR_BY_ASSOCIATION: true,
      USE_ASSOCIATIONS: true,
      USE_CATEGORIES:     true,   // ⟵ ADD/SET THIS
      USE_SOURCES:        true,   // already true, but check
      USE_FULLSCREEN: true,
      USE_SOURCES: true,
      USE_COVER: false,
      GRAPH_NONLOCATED: false,
      HIGHLIGHT_GROUPS: false,
      USE_FILTERS: false
    }
  }
}
