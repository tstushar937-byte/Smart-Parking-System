
package smartparking.service;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import smartparking.entity.ParkingSlot;
import smartparking.repository.ParkingSlotRepository;

@Component
public class DataInitializer implements CommandLineRunner {

    private final ParkingSlotRepository parkingSlotRepository;

    public DataInitializer(ParkingSlotRepository parkingSlotRepository) {
        this.parkingSlotRepository = parkingSlotRepository;
    }

    @Override
    public void run(String... args) {

        if (parkingSlotRepository.count() > 0) {
            return;
        }

        for (int floor = 1; floor <= 4; floor++) {

            for (int i = 1; i <= 8; i++) {
                ParkingSlot carSlot = new ParkingSlot(
                    "F" + floor + "-C" + i,
                    floor,
                    "CAR",
                    "AVAILABLE",
                    30.0
                );

                parkingSlotRepository.save(carSlot);
            }

            for (int i = 1; i <= 4; i++) {
                ParkingSlot bikeSlot = new ParkingSlot(
                    "F" + floor + "-B" + i,
                    floor,
                    "BIKE",
                    "AVAILABLE",
                    10.0
                );

                parkingSlotRepository.save(bikeSlot);
            }
        }

        System.out.println("48 parking slots created successfully!");
    }
}
