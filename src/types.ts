// SimBrief API Response Types

export interface SimbriefResponse {
  fetch?: FetchInfo;
  params?: Params;
  general?: General;
  origin?: Airport;
  destination?: Airport;
  alternate?: Alternate;
  alternate_navlog?: NavLog;
  takeoff_altn?: any;
  enroute_altn?: any;
  enroute_station?: any;
  navlog?: NavLog;
  etops?: any;
  tlr?: any;
  atc?: ATC;
  aircraft?: Aircraft;
  fuel?: Fuel;
  fuel_extra?: FuelExtra;
  times?: Times;
  weights?: Weights;
  impacts?: any;
  crew?: Crew;
  notams?: Notams;
  weather?: Weather;
  sigmets?: any;
  text?: TextData;
  tracks?: any;
  database_updates?: any;
  files?: Files;
  fms_downloads?: any;
  images?: any;
  links?: any;
  prefile?: any;
  vatsim_prefile?: any;
  ivao_prefile?: any;
  pilotedge_prefile?: any;
  poscon_prefile?: any;
  map_data?: any;
  api_params?: any;
}

export interface FetchInfo {
  userid?: string;
  static_id?: string;
  status?: string;
  time?: string;
}

export interface Params {
  request_id?: string;
  sequence_id?: string;
  static_id?: string;
  user_id?: string;
  time_generated?: string;
  xml_file?: string;
  ofp_layout?: string;
  airac?: string;
  units?: string;
}

export interface General {
  release?: string;
  icao_airline?: string;
  flight_number?: string;
  is_etops?: string;
  dx_rmk?: string;
  sys_rmk?: string;
  is_detailed_profile?: string;
  cruise_profile?: string;
  climb_profile?: string;
  descent_profile?: string;
  alternate_profile?: string;
  reserve_profile?: string;
  costindex?: string;
  cont_rule?: string;
  initial_altitude?: string;
  stepclimb_string?: string;
  avg_temp_dev?: string;
  avg_tropopause?: string;
  avg_wind_comp?: string;
  avg_wind_dir?: string;
  avg_wind_spd?: string;
  gc_distance?: string;
  route_distance?: string;
  air_distance?: string;
  total_burn?: string;
  cruise_tas?: string;
  cruise_mach?: string;
  passengers?: string;
  route?: string;
  route_ifps?: string;
  route_navigraph?: string;
  sid_ident?: string;
  sid_trans?: string;
  star_ident?: string;
  star_trans?: string;
}

export interface Airport {
  icao_code?: string;
  iata_code?: string;
  faa_code?: string;
  icao_region?: string;
  elevation?: string;
  pos_lat?: string;
  pos_long?: string;
  name?: string;
  timezone?: string;
  plan_rwy?: string;
  trans_alt?: string;
  trans_level?: string;
  metar?: string;
  metar_time?: string;
  metar_category?: string;
  metar_visibility?: string;
  metar_ceiling?: string;
  taf?: string;
  taf_time?: string;
  atis?: any[];
  notam?: any[];
}

export interface Alternate extends Airport {
  cruise_altitude?: string;
  distance?: string;
  gc_distance?: string;
  air_distance?: string;
  track_true?: string;
  track_mag?: string;
  tas?: string;
  gs?: string;
  avg_wind_comp?: string;
  avg_wind_dir?: string;
  avg_wind_spd?: string;
  avg_tropopause?: string;
  avg_tdv?: string;
  ete?: string;
  burn?: string;
  route?: string;
  route_ifps?: string;
}

export interface NavLog {
  fix?: NavLogFix[];
}

export interface NavLogFix {
  ident?: string;
  name?: string;
  type?: string;
  icao_region?: string;
  region_code?: string;
  frequency?: string;
  pos_lat?: string;
  pos_long?: string;
  stage?: string;
  via_airway?: string;
  is_sid_star?: string;
  distance?: string;
  track_true?: string;
  track_mag?: string;
  heading_true?: string;
  heading_mag?: string;
  altitude_feet?: string;
  ind_airspeed?: string;
  true_airspeed?: string;
  mach?: string;
  mach_thousandths?: string;
  wind_component?: string;
  groundspeed?: string;
  time_leg?: string;
  time_total?: string;
  fuel_flow?: string;
  fuel_leg?: string;
  fuel_totalused?: string;
  fuel_min_onboard?: string;
  fuel_plan_onboard?: string;
  oat?: string;
  oat_isa_dev?: string;
  wind_dir?: string;
  wind_spd?: string;
  shear?: string;
  tropopause_feet?: string;
  ground_height?: string;
  fir?: string;
  fir_units?: string;
  fir_valid_levels?: string;
  mora?: string;
  wind_data?: any;
  fir_crossing?: any;
}

export interface ATC {
  flightplan_text?: string;
  route?: string;
  route_ifps?: string;
  callsign?: string;
  flight_type?: string;
  flight_rules?: string;
  initial_spd?: string;
  initial_spd_unit?: string;
  initial_alt?: string;
  initial_alt_unit?: string;
  section18?: string;
  fir_orig?: string;
  fir_dest?: string;
  fir_altn?: string;
  fir_etops?: string;
  fir_enroute?: string;
}

export interface Aircraft {
  icaocode?: string;
  iatacode?: string;
  base_type?: string;
  list_type?: string;
  icao_code?: string;
  iata_code?: string;
  name?: string;
  engines?: string;
  reg?: string;
  fin?: string;
  selcal?: string;
  equip?: string;
  equip_category?: string;
  equip_navigation?: string;
  equip_transponder?: string;
  fuelfact?: string;
  fuelfactor?: string;
  max_passengers?: string;
  supports_tlr?: string;
  internal_id?: string;
  is_custom?: string;
}

export interface Fuel {
  taxi?: string;
  enroute_burn?: string;
  contingency?: string;
  alternate_burn?: string;
  reserve?: string;
  etops?: string;
  extra?: string;
  extra_required?: string;
  extra_optional?: string;
  min_takeoff?: string;
  plan_takeoff?: string;
  plan_ramp?: string;
  plan_landing?: string;
  avg_fuel_flow?: string;
  max_tanks?: string;
}

export interface FuelExtra {
  bucket?: FuelBucket[];
}

export interface FuelBucket {
  label?: string;
  fuel?: string;
  time?: string;
  required?: string;
}

export interface Times {
  est_time_enroute?: string;
  sched_time_enroute?: string;
  sched_out?: string;
  sched_off?: string;
  sched_on?: string;
  sched_in?: string;
  sched_block?: string;
  est_out?: string;
  est_off?: string;
  est_on?: string;
  est_in?: string;
  est_block?: string;
  orig_timezone?: string;
  dest_timezone?: string;
  taxi_out?: string;
  taxi_in?: string;
  reserve_time?: string;
  endurance?: string;
  contfuel_time?: string;
  etopsfuel_time?: string;
  extrafuel_time?: string;
}

export interface Weights {
  oew?: string;
  pax_count?: string;
  bag_count?: string;
  pax_count_actual?: string;
  bag_count_actual?: string;
  pax_weight?: string;
  bag_weight?: string;
  freight_added?: string;
  cargo?: string;
  payload?: string;
  est_zfw?: string;
  max_zfw?: string;
  est_tow?: string;
  max_tow?: string;
  max_tow_struct?: string;
  tow_limit_code?: string;
  est_ldw?: string;
  max_ldw?: string;
  est_ramp?: string;
}

export interface Crew {
  pilot_id?: string;
  cpt?: string;
  fo?: string;
  dx?: string;
  pu?: string;
}

export interface Notams {
  notamdrec?: any[];
  "rec-count"?: string;
}

export interface Weather {
  orig_metar?: string;
  orig_taf?: string;
  dest_metar?: string;
  dest_taf?: string;
  altn_metar?: string;
  altn_taf?: string;
  toaltn_metar?: string;
  toaltn_taf?: string;
  eualtn_metar?: string;
  eualtn_taf?: string;
  etops_metar?: string;
  etops_taf?: string;
}

export interface TextData {
  nat_tracks?: string;
  tlr_section?: string;
  plan_html?: string;
}

export interface Files {
  directory?: string;
  pdf?: FileInfo;
  file?: FileInfo[];
}

export interface FileInfo {
  name?: string;
  link?: string;
}
