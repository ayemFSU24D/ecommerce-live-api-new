import { Request, Response } from "express";
import { db } from "../config/db";
import { STRIPE_SECRET_KEY } from "../constants/env";
const stripe = require('stripe')(STRIPE_SECRET_KEY);
//----------uppe är koden från Sibar-----------------

