const axios = require("axios");

const launches = require("./launches.mongo");
const planets = require("./planets.mongo");

const DEFAULT_FLIGHT_NUMBER = 100;

const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";

async function populateLaunches() {
    console.log("Downloading launch data");
    const res = await axios.post(SPACEX_API_URL, {
        query: {},
        options: {
            pagination: false,
            populate: [
                {
                    path: "rocket",
                    select: {
                        name: 1,
                    },
                },
                {
                    path: "payloads",
                    select: {
                        customers: 1,
                    },
                },
            ],
        },
    });

    if (res.status !== 200) {
        console.log("Problem downloading launch data");
    }

    const launchDocs = res.data.docs;
    for (const launchDoc of launchDocs) {
        const payloads = launchDoc["payloads"];
        const customers = payloads.flatMap((payload) => {
            return payload["customers"];
        });

        const launch = {
            flightNumber: launchDoc["flight_number"],
            mission: launchDoc["name"],
            rocket: launchDoc["rocket"]["name"],
            launchDate: launchDoc["date_local"],
            upcoming: launchDoc["upcoming"],
            success: launchDoc["success"],
            customers: customers,
        };
        console.log(`${launch.flightNumber} ${launch.mission}`);

        await saveLaunch(launch);
    }
}

async function loadLaunchesData() {
    const firstLaunch = await findLaunch({
        flightNumber: 1,
        rocket: "FalconSat",
        mission: "FalconSat",
    });

    if (firstLaunch) {
        console.log("launch data already exits");
    } else {
        await populateLaunches();
    }
}

async function findLaunch(filter) {
    return await launches.findOne(filter);
}

async function existsLaunchWithId(launchId) {
    return await findLaunch({
        flightNumber: launchId,
    });
}

async function getLatestFlightNumber() {
    const latestLaunch = await launches.findOne().sort("-flightNumber"); //the minus in front of flightNumber signifies decending launch

    if (!latestLaunch) {
        return DEFAULT_FLIGHT_NUMBER;
    }

    return latestLaunch.flightNumber;
}

async function getAllLaunches(skip, limit) {
    return await launches
        .find({}, { _id: 0, __v: 0 })
        .limit(limit)
        .skip(skip)
        .sort({ flightNumber: 1 });
}

async function saveLaunch(launch) {
    //this function acts as a map.set function
    await launches.findOneAndUpdate(
        {
            flightNumber: launch.flightNumber,
        },
        launch,
        {
            upsert: true,
        }
    );
}

async function scheduleNewLaunch(launch) {
    const planet = await planets.findOne({
        kepler_name: launch.target,
    });

    if (!planet) {
        throw new Error("No matching Planet found");
    }

    const newFlightNumber = (await getLatestFlightNumber()) + 1;

    const newLaunch = Object.assign(launch, {
        upcoming: true,
        success: true,
        customers: ["NASA"],
        flightNumber: newFlightNumber,
    });

    await saveLaunch(newLaunch);
} //this function acts as a addNewLaunch function which assigns the values to a launch object and ships it to the saveLaunch function

async function abortLaunchById(launchId) {
    const abortedLaunch = await launches.updateOne(
        {
            flightNumber: launchId,
        },
        {
            upcoming: false,
            success: false,
        }
    );

    return abortedLaunch.modifiedCount === 1;
}

module.exports = {
    existsLaunchWithId,
    getAllLaunches,
    scheduleNewLaunch,
    abortLaunchById,
    loadLaunchesData,
};
