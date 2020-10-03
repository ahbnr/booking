import {Request, Response} from 'express';
import {isWeekdayInterface, isWeekdayName, Weekday, WeekdayInterface, WeekdayName} from "../models/weekday.model";
import {DestroyOptions, UpdateOptions} from "sequelize";
import {ControllerError} from "./errors";
import {boundClass} from "autobind-decorator";
import {Timeslot} from "../models/timeslot.model";
import {TimeslotsController} from "./timeslots.controller";

@boundClass
export class WeekdaysController {
    public async index(req: Request, res: Response) {
        const weekdays = await Weekday.findAll({});

        res.json(weekdays);
    }

    public async create(req: Request, res: Response) {
        const weekdayName = WeekdaysController.retrieveWeekdayName(req, res);
        if (weekdayName != null)  {
            const weekdayData = WeekdaysController.retrieveWeekdayData(req, res);

            if (weekdayData != null)  {
                try {
                    const weekday = await Weekday.create({
                        ...weekdayData,
                        name: weekdayName
                    });

                    res.status(201).json(weekday);
                }

                catch (error) {
                    res.status(500).json(error);
                }
            }
        }
    }

    public async show(req: Request, res: Response) {
        const weekday = await this.getWeekday(req, res);

        res.json(weekday);
    }

    public async createTimeslot(req: Request, res: Response) {
        const weekday = await this.getWeekday(req, res);

        const timeslotData = TimeslotsController.retrieveTimeslotData(req, res);
        if (timeslotData != null) {
            try {
                const timeslot = await Timeslot.create<Timeslot>({
                    weekdayName: weekday.name,
                    ...timeslotData
                });

                res.status(201).json(timeslot);
            }

            catch (error) {
                res.status(500).json(error);
            }
        }
    }

    public async getTimeslots(req: Request, res: Response) {
        const weekday = await this.getWeekday(req, res);
        const timeslots = weekday?.timeslots;

        if (timeslots != null) {
            res.json(timeslots);
        }

        else {
            res.json([])
        }
    }

    private async getWeekday(req: Request, res: Response): Promise<Weekday> {
        const weekdayName = WeekdaysController.retrieveWeekdayName(req, res);
        const weekday = await Weekday.findByPk<Weekday>(weekdayName, {include: [Timeslot]});

        if (weekday != null) {
            return weekday;
        }

        else {
            throw new ControllerError("Weekday not found", 404);
        }
    }

    public async update(req: Request, res: Response) {
        const weekdayName = WeekdaysController.retrieveWeekdayName(req, res);

        if (weekdayName != null) {
            const weekdayData = WeekdaysController.retrieveWeekdayData(req, res);
            if (weekdayData != null) {
                const update: UpdateOptions = {
                    where: { name: weekdayName },
                    limit: 1,
                };

                try {
                    await Weekday.update(weekdayData, update);

                    res.status(202).json({ data: "success" })
                }

                catch (error) {
                    res.status(500).json(error);
                }
            }
        }
    }

    public async delete(req: Request, res: Response) {
        const weekdayName: string | null | undefined = req.params.name;

        if (weekdayName != null)  {
            const options: DestroyOptions = {
                where: { name: weekdayName },
                limit: 1,
            };

            try {
                await Weekday.destroy(options);

                res.status(204).json({ data: "success" })
            }

            catch (error) {
                res.status(500).json(error)
            }
        }

        else {
            res.status(500).json({data: "Weekday not specified."})
        }
    }

    private static retrieveWeekdayName(req: Request, res: Response): WeekdayName {
        const weekdayName = req.params.name;
        if (isWeekdayName(weekdayName)) {
            return weekdayName;
        }

        else {
            throw new ControllerError("No such weekday", 500);
        }
    }

    private static retrieveWeekdayData(req: Request, res: Response): WeekdayInterface | null {
        const weekdayData = req.body;
        if (isWeekdayInterface(weekdayData)) {
            return weekdayData;
        }

        else {
            res.status(500).json({ errors: ["Invalid weekday data format."] });
            return null;
        }
    }
}