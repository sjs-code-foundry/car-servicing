/* ============
    Imports
   ============ */

/* ============
    Database
   ============ */

const countryCodes = {};

/* ========================
    Object Constructors
   ======================== */

/* ============
    Functions
   ============ */

export function vinDecode(vin) {
    console.log(`Decoding VIN: ${vin}`);

    // ISO 3779 Standard:
    // https://en.wikipedia.org/wiki/Vehicle_identification_number

    // Decode first 3 digits (Country of Origin)
    worldManufacturerId(vin);

    // Decode next 6 digits (Vehicle Description)
    vehicleDescription(vin);

    // Decode last 8 elements (Vehicle Identification)
    vehicleId(vin);
}

function worldManufacturerId(vin) {
    const vinPart = vin.substring(0, 3);

    console.log(vinPart);
}

function vehicleDescription(vin) {
    const vinPart = vin.substring(3, 9);

    console.log(vinPart);
}

function vehicleId(vin) {
    const vinPart = vin.substring(9, 17);

    console.log(vinPart);
}
