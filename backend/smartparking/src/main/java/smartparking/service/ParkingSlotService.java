
package smartparking.service;

import java.util.List;

import org.springframework.stereotype.Service;

import smartparking.entity.ParkingSlot;
import smartparking.repository.ParkingSlotRepository;

@Service
public class ParkingSlotService {

    private final ParkingSlotRepository parkingSlotRepository;

    public ParkingSlotService(ParkingSlotRepository parkingSlotRepository) {
        this.parkingSlotRepository = parkingSlotRepository;
    }

    public List<ParkingSlot> getAllSlots() {
        return parkingSlotRepository.findAll();
    }

    public List<ParkingSlot> getSlotsByFloor(int floor) {
        return parkingSlotRepository.findByFloor(floor);
    }

    public List<ParkingSlot> getSlotsByVehicleType(String vehicleType) {
        return parkingSlotRepository.findByVehicleType(vehicleType);
    }

    public ParkingSlot updateSlotStatus(Long id, String status) {
        ParkingSlot slot = parkingSlotRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Parking slot not found"));

        slot.setStatus(status.toUpperCase());

        return parkingSlotRepository.save(slot);
    }
}
