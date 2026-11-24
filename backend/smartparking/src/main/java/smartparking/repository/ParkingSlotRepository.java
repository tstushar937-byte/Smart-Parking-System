
package smartparking.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import smartparking.entity.ParkingSlot;

public interface ParkingSlotRepository extends JpaRepository<ParkingSlot, Long> {

    List<ParkingSlot> findByFloor(int floor);

    List<ParkingSlot> findByVehicleType(String vehicleType);

    List<ParkingSlot> findByFloorAndVehicleType(int floor, String vehicleType);

    List<ParkingSlot> findByStatus(String status);
}
