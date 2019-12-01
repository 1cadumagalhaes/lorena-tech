SELECT 
  *
FROM
  `lorena-tech.loftechbase123i.baseloft`
WHERE
  REGEXP_CONTAINS(longitude, "-?[0-9]{1,2}[.][0-9]{8}") AND REGEXP_CONTAINS(latitude, "-?[0-9]{1,2}[.][0-9]{8}") AND NOT REGEXP_CONTAINS(address, "^[A-Z]{1}$") AND NOT point_estimate ="-1"
  