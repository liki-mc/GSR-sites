import { FSR } from "@prisma/client";

function isFSR(fsr: string): fsr is FSR {
    return Object.values(FSR).includes(fsr as FSR);
}

export {
    isFSR,
};