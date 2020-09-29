import {Request, Response} from 'express';
import {DestroyOptions, UpdateOptions} from "sequelize";
import {isTimeslotInterface, Timeslot, TimeslotInterface} from "../models/timeslots.model";
import {Weekday} from "../models/weekday.model";
import {ControllerError} from "./errors";
import {boundClass} from "autobind-decorator";

@boundClass
export class TimeslotsController {
    public async index(req: Request, res: Response) {
        const timeslots = await Timeslot.findAll<Timeslot>({});

        res.json(timeslots);
    }

    public async create(req: Request, res: Response) {
        const timeslotData = TimeslotsController.retrieveTimeslotData(req, res);

        if (timeslotData != null) {
            try {
                const timeslot = await Timeslot.create<Timeslot>(timeslotData);

                res.status(201).json(timeslot);
            }

            catch (error) {
                res.status(500).json(error);
            }
        }
    }

    public async show(req: Request, res: Response) {
        const timeslot = await this.getTimeslot(req, res);

        res.json(timeslot);
    }

    public async getBooking(req: Request, res: Response) {
        const timeslot = await this.getTimeslot(req, res);
        const booking = timeslot?.booking;

        if (booking != null) {
            res.json(booking);
        }

        else {
            throw new ControllerError("No booking for this timeslot", 404);
        }
    }

    private async getTimeslot(req: Request, res: Response): Promise<Timeslot> {
        const timeslot = await Timeslot.findByPk<Timeslot>(req.params.id);

        if (timeslot != null) {
            return timeslot;
        }

        else {
            throw new ControllerError("Timeslot not found", 404);
        }
    }

    public async update(req: Request, res: Response) {
        const timeslotData = TimeslotsController.retrieveTimeslotData(req, res);

        if (timeslotData != null) {
            const update: UpdateOptions = {
                where: { id: req.params.id },
                limit: 1,
            };

            try {
                await Timeslot.update(timeslotData, update);

                res.status(202).json({ data: "success" })
            }

            catch (error) {
                res.status(500).json(error);
            }
        }
    }

    public async delete(req: Request, res: Response) {
        const options: DestroyOptions = {
            where: { id: req.params.id },
            limit: 1,
        };

        try {
            await Timeslot.destroy(options);

            res.status(204).json({ data: "success" })
        }

        catch (error) {
            res.status(500).json(error)
        }
    }

    private static retrieveTimeslotData(req: Request, res: Response): TimeslotInterface | null {
        const timeslotData = req.body;
        if (isTimeslotInterface(timeslotData)) {
            return timeslotData;
        }

        else {
            res.status(500).json({ errors: ["Invalid timeslot format."] });
            return null;
        }
    }
}
