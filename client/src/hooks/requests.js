const API_URL = "http://localhost:8080/v1";

async function httpGetPlanets() {
    const res = await fetch(`${API_URL}/planets`);

    const result = await res.json();
    console.log(result);

    return result;
}

async function httpGetLaunches() {
    const res = await fetch(`${API_URL}/launches`);
    const result = await res.json();
    console.log(result);

    return result.sort((a, b) => {
        return a.flightNumber - b.flightNumber;
    });
}

// Submit given launch data to launch system.
async function httpSubmitLaunch(launch) {
    try {
        return await fetch(`${API_URL}/launches`, {
            method: "post",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(launch),
        });
    } catch (err) {
        return {
            ok: false,
        };
    }
}

// Delete launch with given ID.
async function httpAbortLaunch(id) {
    try {
        return await fetch(`${API_URL}/launches/${id}`, {
            method: "delete",
        });
    } catch (err) {
        console.log(err);
        return {
            ok: false,
        };
    }
}

export { httpGetPlanets, httpGetLaunches, httpSubmitLaunch, httpAbortLaunch };
