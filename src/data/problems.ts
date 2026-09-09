import { Problem } from '../domain/Problem';

export const PROBLEMS: readonly Problem[] = [
  {
    id: 'parking-lot',
    title: 'Design a Parking Lot',
    description:
      'Design an object-oriented parking lot management system capable of handling multi-floor capacity, diverse vehicle types, parking spot allocation, ticket issuance, and fee calculation.',
    requirements: [
      'Support multiple floors with designated spot sizes (Small, Medium, Large).',
      'Support at least 3 vehicle types: Motorcycle, Car, and Truck.',
      'A vehicle can only park in an appropriately sized spot (Motorcycle -> Small/Med/Large, Car -> Med/Large, Truck -> Large).',
      'Issue a parking ticket with timestamp upon vehicle entry.',
      'Calculate fees on exit based on parking duration and vehicle type using a decoupled strategy.',
    ],
    rubric: [
      {
        id: 'req-vehicle-abstraction',
        description: 'Polymorphic Vehicle hierarchy (e.g. abstract Vehicle or interface) rather than hardcoded string types.',
      },
      {
        id: 'req-spot-encapsulation',
        description: 'ParkingSpot encapsulates its availability and dimension-fit logic.',
      },
      {
        id: 'req-lot-cohesion',
        description: 'ParkingLot delegates spot finding to ParkingFloor or a dedicated SpotManager rather than holding god-class responsibilities.',
      },
      {
        id: 'req-fee-strategy',
        description: 'Fee calculation is decoupled behind a FeeStrategy or PricingPolicy interface for extensibility.',
      },
    ],
  },
  {
    id: 'elevator-system',
    title: 'Design an Elevator System',
    description:
      'Design a multi-elevator scheduling and dispatch system for a high-rise building with internal cabin requests, external floor hall calls, and extensible scheduling algorithms.',
    requirements: [
      'Support N floors and M elevator cars operating concurrently.',
      'Elevator cars move UP, DOWN, or remain IDLE.',
      'Handle external hall calls (source floor, direction) and internal cabin calls (destination floor).',
      'Encapsulate elevator state (current floor, direction, door status, request queue).',
      'Decouple dispatch algorithm (e.g., SCAN, LOOK, Nearest-Car) behind an extensible strategy interface.',
    ],
    rubric: [
      {
        id: 'req-elevator-state',
        description: 'ElevatorCar encapsulates its mechanical state (Floor, Direction, DoorState) and movement operations.',
      },
      {
        id: 'req-request-abstraction',
        description: 'Clear abstraction for Requests (Internal vs External / HallCall vs CabinCall).',
      },
      {
        id: 'req-dispatch-strategy',
        description: 'Elevator dispatch logic is isolated behind an ElevatorDispatcher / DispatchStrategy interface.',
      },
      {
        id: 'req-system-coordinator',
        description: 'ElevatorSystem acts as the facade or orchestrator routing requests without violating single responsibility.',
      },
    ],
  },
];

export function getProblemById(id: string): Problem | undefined {
  return PROBLEMS.find((p) => p.id === id);
}
