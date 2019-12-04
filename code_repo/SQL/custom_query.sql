WITH D AS (WITH geo AS (SELECT 
  *,
  ST_GEOGPOINT(CAST(longitude AS FLOAT64), CAST(latitude AS FLOAT64)) as loc_ape,
  ST_GEOGPOINT(-46.6623264,-23.5537803) as loc_escolhida
FROM
  \`loftechbase123i.view_baseloft\`
)
SELECT
  city, state, address, tower_name, building_type, CAST(rooms AS INT64) as rooms, CAST(garages AS INT64) as garages, CAST(useful_area AS INT64) as useful_area, CAST(point_estimate AS FLOAT64) as point_estimate, CAST(minimum_estimate AS FLOAT64) as minimum_estimate, CAST(maximum_estimate AS FLOAT64) as maximum_estimate,
  ST_DISTANCE(loc_escolhida,loc_ape) as distance 
FROM 
  geo)
SELECT
  * 
FROM
  D
WHERE
  distance < 1000 AND minimum_estimate<800000
ORDER BY
  distance ASC
LIMIT 10