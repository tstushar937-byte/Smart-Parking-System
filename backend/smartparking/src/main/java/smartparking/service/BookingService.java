
package smartparking.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import smartparking.entity.Booking;
import smartparking.entity.ParkingSlot;
import smartparking.entity.User;
import smartparking.repository.BookingRepository;
import smartparking.repository.ParkingSlotRepository;
import smartparking.repository.UserRepository;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ParkingSlotRepository parkingSlotRepository;
    private final UserRepository userRepository;

    public BookingService(
            BookingRepository bookingRepository,
            ParkingSlotRepository parkingSlotRepository,
            UserRepository userRepository) {

        this.bookingRepository = bookingRepository;
        this.parkingSlotRepository = parkingSlotRepository;
        this.userRepository = userRepository;
    }

    // Existing method for immediate parking
    @Transactional
    public Booking createBooking(
            Long userId,
            Long slotId,
            String vehicleNumber,
            int durationHours) {

        return createBooking(
                userId,
                slotId,
                vehicleNumber,
                durationHours,
                LocalDateTime.now()
        );
    }

    // Method supporting immediate and advance booking
    @Transactional
    public Booking createBooking(
            Long userId,
            Long slotId,
            String vehicleNumber,
            int durationHours,
            LocalDateTime startTime) {

        if (durationHours <= 0) {
            throw new IllegalArgumentException(
                    "Duration must be greater than zero");
        }

        if (vehicleNumber == null || vehicleNumber.isBlank()) {
            throw new IllegalArgumentException(
                    "Vehicle number is required");
        }

        if (startTime == null) {
            throw new IllegalArgumentException(
                    "Arrival date and time are required");
        }

        LocalDateTime now = LocalDateTime.now();
        
        System.out.println("SERVER TIME: " + now);
        System.out.println("BOOKING START TIME: " + startTime);
        System.out.println("BOOKING STARTS NOW: " + !startTime.isAfter(now));

        if (startTime.isBefore(now)) {
            throw new IllegalArgumentException(
                    "Arrival time cannot be in the past");
        }

        String formattedVehicleNumber = vehicleNumber
                .trim()
                .toUpperCase()
                .replaceAll("[\\s-]", "");

        if (!formattedVehicleNumber.matches(
                "^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}$")) {

            throw new RuntimeException(
                    "Invalid vehicle number. Example: UK04AB1234");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        ParkingSlot slot = parkingSlotRepository.findById(slotId)
                .orElseThrow(() ->
                        new RuntimeException("Parking slot not found"));

        if ("UNDER_CONSTRUCTION".equalsIgnoreCase(slot.getStatus())) {
            throw new RuntimeException(
                    "This parking slot is under construction");
        }

        LocalDateTime endTime = startTime.plusHours(durationHours);

        boolean alreadyBooked =
                bookingRepository.existsOverlappingBooking(
                        slotId,
                        startTime,
                        endTime
                );

        if (alreadyBooked) {
            throw new RuntimeException(
                    "This parking slot is already booked for the selected time");
        }

        boolean bookingStartsNow =
        !startTime.isAfter(now);

        if (bookingStartsNow &&
                    !"AVAILABLE".equalsIgnoreCase(slot.getStatus())) {

                throw new RuntimeException(
                     "Parking slot is not currently available");
        }

        double totalAmount =
                slot.getPricePerHour() * durationHours;

        Booking booking = new Booking();

        booking.setUser(user);
        booking.setParkingSlot(slot);
        booking.setVehicleNumber(formattedVehicleNumber);
        booking.setBookingTime(now);
        booking.setStartTime(startTime);
        booking.setEndTime(endTime);
        booking.setDurationHours(durationHours);
        booking.setTotalAmount(totalAmount);
        booking.setStatus("CONFIRMED");

        if (bookingStartsNow) {
             slot.setStatus("OCCUPIED");
             parkingSlotRepository.save(slot);
        }
        
        return bookingRepository.save(booking);
    }

    // Cancel booking for the authenticated customer
    @Transactional
    public Booking cancelBooking(Long bookingId, Long userId) {

        Booking booking = bookingRepository
                .findByIdAndUserId(bookingId, userId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Booking not found or you are not authorized"));

        if (!"CONFIRMED".equalsIgnoreCase(booking.getStatus())) {
            throw new RuntimeException(
                    "Only confirmed bookings can be cancelled");
        }

        LocalDateTime now = LocalDateTime.now();

        if (!booking.getEndTime().isAfter(now)) {
            throw new RuntimeException(
                    "This booking has already ended and cannot be cancelled");
        }

        // Release the slot only if this booking is currently active
        if (!booking.getStartTime().isAfter(now)) {

            ParkingSlot slot = booking.getParkingSlot();

            slot.setStatus("AVAILABLE");

            parkingSlotRepository.save(slot);
        }

        booking.setStatus("CANCELLED");

        return bookingRepository.save(booking);
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public List<Booking> getBookingsByUser(Long userId) {
        return bookingRepository.findByUserId(userId);
    }
}
