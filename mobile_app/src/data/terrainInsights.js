export const TERRAIN_INSIGHTS = {
  grassy: {
    description: 'The model indicates a vegetation-covered surface with a generally open and stable ground profile.',
    surfaceType: 'Vegetated ground',
    traversability: 'Generally suitable for cautious movement',
    typicalUseCase: 'Routine rover patrols and field observation',
    environmentalCharacteristics: 'Open terrain with moderate cover and manageable footing when dry',
    vehicleCategory: 'Light rover or compact utility vehicle',
    navigationRecommendation: 'Maintain a steady pace and monitor for shallow uneven ground.',
    operationalNotes: 'A practical choice for standard scouting routes with clear visibility.'
  },
  marshy: {
    description: 'The model indicates a wet or soft terrain profile that may reduce traction and increase slip risk.',
    surfaceType: 'Soft or water-affected ground',
    traversability: 'Best handled with slow, deliberate motion',
    typicalUseCase: 'Low-speed survey and obstacle mapping',
    environmentalCharacteristics: 'Moist conditions and limited ground stability',
    vehicleCategory: 'Tracked or all-wheel-drive support vehicle',
    navigationRecommendation: 'Avoid high-speed maneuvers and favor established paths.',
    operationalNotes: 'Plan extra time for route assessment and traction checks.'
  },
  rocky: {
    description: 'The model points to a terrain profile shaped by stones, uneven surfaces, and a higher obstacle burden.',
    surfaceType: 'Rocky or irregular ground',
    traversability: 'Suitable for controlled movement with careful route selection',
    typicalUseCase: 'Obstacle mapping and hazard-aware navigation',
    environmentalCharacteristics: 'Irregular surfaces with enhanced impact risk',
    vehicleCategory: 'Tracked or high-clearance rover',
    navigationRecommendation: 'Favor slower movement and avoid sharp turns near loose edges.',
    operationalNotes: 'Keep suspension and clearance considerations in mind during planning.'
  },
  sandy: {
    description: 'The model suggests a loose granular surface that can shift under wheel or track load.',
    surfaceType: 'Loose granular ground',
    traversability: 'Generally manageable with measured speed',
    typicalUseCase: 'Reconnaissance and wide-area survey',
    environmentalCharacteristics: 'Low vegetation with shifting surface conditions',
    vehicleCategory: 'All-wheel-drive rover or sand-capable vehicle',
    navigationRecommendation: 'Maintain momentum and avoid abrupt braking.',
    operationalNotes: 'Monitor wheel slip and route consistency during transit.'
  },
  snowy: {
    description: 'The model indicates a snow-covered or icy surface that may reduce grip and increase control demands.',
    surfaceType: 'Snow or ice-affected ground',
    traversability: 'Best approached with cautious, controlled movement',
    typicalUseCase: 'Winter field monitoring and low-speed mobility operations',
    environmentalCharacteristics: 'Cold conditions with reduced traction and added control demands',
    vehicleCategory: 'Tracked vehicle with winter-ready configuration',
    navigationRecommendation: 'Reduce speed and prioritize stable, predictable routes.',
    operationalNotes: 'Prepare for lower traction and longer stopping distances.'
  }
};

export function getTerrainInsight(terrainClass) {
  return TERRAIN_INSIGHTS[terrainClass] || TERRAIN_INSIGHTS.grassy;
}
