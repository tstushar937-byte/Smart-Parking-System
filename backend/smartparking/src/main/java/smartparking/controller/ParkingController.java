
package smartparking.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import smartparking.entity.ParkingSlot;
import smartparking.service.ParkingSlotService;

@RestController
@RequestMapping("/api/parking")
@CrossOrigin(origins = "http://127.0.0.1:5500")
public class ParkingController {

    private final ParkingSlotService parkingSlotService;

    public ParkingController(ParkingSlotService parkingSlotService) {
        this.parkingSlotService = parkingSlotService;
    }

    // Get all parking slots
    @GetMapping("/slots")
    public List<ParkingSlot> getAllSlots() {
        return parkingSlotService.getAllSlots();
    }

    // Get slots by floor
    @GetMapping("/floor/{floor}")
    public List<ParkingSlot> getSlotsByFloor(@PathVariable int floor) {
        return parkingSlotService.getSlotsByFloor(floor);
    }

    // Get slots by vehicle type
    @GetMapping("/vehicle/{vehicleType}")
    public List<ParkingSlot> getSlotsByVehicleType(
            @PathVariable String vehicleType) {
        return parkingSlotService.getSlotsByVehicleType(
                vehicleType.toUpperCase());
    }

    // Update slot status
    @PutMapping("/slots/{id}/status")
    public ParkingSlot updateSlotStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return parkingSlotService.updateSlotStatus(id, status);
    }
}
