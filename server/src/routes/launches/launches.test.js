const request = require("supertest");
const app = require("../../app");
const { mongoConnect, mongoDisconnect } = require("../../services/mongo");

describe("Launches API", () => {
    beforeAll(async () => {
        await mongoConnect();
    });

    afterAll(async () => {
        await mongoDisconnect();
    });

    describe("Test GET /launch", () => {
        test("It should respond with 200 success", async () => {
            const res = await request(app)
                .get("/v1/launches")
                .expect(200)
                .expect("Content-Type", /json/);
            expect(res.statusCode).toBe(200);
        });
    });

    describe("Test POST /launch", () => {
        const completeLaunchData = {
            mission: "MUP4455",
            rocket: "Starship IS44",
            target: "Kepler-1652 b",
            launchDate: "January 17, 2033",
        };

        const launchDataWithoutDate = {
            mission: "MUP4455",
            rocket: "Starship IS44",
            target: "Kepler-1652 b",
        };

        const launchDataWithInvalidDate = {
            mission: "MUP4455",
            rocket: "Starship IS44",
            target: "Kepler-1652 b",
            launchDate: "Hello",
        };

        test("It should respond with 201 created", async () => {
            const res = await request(app)
                .post("/v1/launches")
                .send(completeLaunchData)
                .expect(201)
                .expect("Content-Type", /json/);

            const requestDate = new Date(
                completeLaunchData.launchDate
            ).valueOf();
            const responseDate = new Date(res.body.launchDate).valueOf();

            expect(responseDate).toBe(requestDate);

            expect(res.body).toMatchObject(launchDataWithoutDate);
        });
        test("It should catch missing required properties", async () => {
            const res = await request(app)
                .post("/v1/launches")
                .send(launchDataWithoutDate)
                .expect(400)
                .expect("Content-Type", /json/);

            expect(res.body).toStrictEqual({ error: "Missing Data" });
        });
        test("It should catch invalid date", async () => {
            const res = await request(app)
                .post("/v1/launches")
                .send(launchDataWithInvalidDate)
                .expect(400)
                .expect("Content-Type", /json/);

            expect(res.body).toStrictEqual({ error: "Inappropriate Date" });
        });
    });
});
