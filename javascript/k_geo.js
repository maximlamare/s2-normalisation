function deg2rad(x){
  // Convert degrees to radians
  return x * Math.PI / 180;
}

function rad2deg(x){
  // Convert degrees to radians
  return x / Math.PI * 180;
}

function sec(x){
  // Calculate the secant of a value
  return 1 / Math.cos(x);
}

function relative_azimuth(saa, vaa){
  // Calculate relative azimuth angle
  // Angles in RAD !
  // return vaa - saa;
  return Math.abs(vaa - Math.PI - saa);
}

function calc_Kgeo(sza, vza, saa, vaa){
  // Calculate the LiSparse kernel from Lucht et al. 2000
  // Angles in RAD !

  // Relative azimuth
  var phi = relative_azimuth(vaa, saa)
  
  // theta_prime = Math.atan(b / r * Math.tan(sza)) simplifies because b/r = 1
  var theta_prime = sza
  // vartheta_prime = Math.atan(b / r * Math.tan(vza)) simplifies because b/r = 1
  var vartheta_prime =  vza

  var cos_xi_prime = Math.cos(theta_prime) * Math.cos(vartheta_prime) + Math.sin(theta_prime) * Math.sin(vartheta_prime) * Math.cos(phi);

  // Calculate t, broken up for clarity
  // h / b = 2
  var D = Math.sqrt(Math.pow(Math.tan(theta_prime), 2) + Math.pow(Math.tan(vartheta_prime), 2) - 2 * Math.tan(theta_prime) * Math.tan(vartheta_prime) * Math.cos(phi));
  var tantansin = Math.tan(theta_prime) * Math.tan(vartheta_prime) * Math.sin(phi);
  var costtop = Math.sqrt(Math.pow(D, 2) + Math.pow(tantansin, 2))
  var cost = 2 * costtop / (sec(theta_prime) + sec(vartheta_prime))
  var t = Math.acos(Math.min(1, cost));

  // Calculate O
  var O = (1 / Math.PI) * (t - Math.sin(t) * Math.cos(t)) * (sec(theta_prime) + sec(vartheta_prime));

  // Kgeo
  kgeo = O - sec(theta_prime) - sec(vartheta_prime) + 1 / 2 * (1 + cos_xi_prime) * sec(theta_prime) * sec(vartheta_prime);

  return kgeo;
}


var SZA = 45
var SAA = 180
var VAA = 0

// Initialise angles and results
var angles = []
var results = []

for (i=0;i<90; i+=10){
    var sza = deg2rad(SZA)
    var saa = deg2rad(SAA)
    var vza = deg2rad(i)
    var vaa = deg2rad(VAA)
    
    var raa = relative_azimuth(saa, vaa)
    
    angles.push(i)
    
    // HDF
    results.push(calc_Kgeo(sza, vza, saa, vaa))   
}

console.log(angles)
console.log(results)