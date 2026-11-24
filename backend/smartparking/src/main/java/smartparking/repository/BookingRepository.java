
package smartparking.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import smartparking.entity.Booking;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserId(Long userId);

    Optional<Booking> findByIdAndUserId(Long id, Long userId);

    List<Booking> findByParkingSlotId(Long parkingSlotId);

    List<Booking> findByStatus(String status);

    @Query("""
        SELECT COUNT(b) > 0
        FROM Booking b
        WHERE b.parkingSlot.id = :slotId
        AND b.status = 'CONFIRMED'
        AND b.startTime < :endTime
        AND b.endTime > :startTime
    """)
    boolean existsOverlappingBooking(
            @Param("slotId") Long slotId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );
}
