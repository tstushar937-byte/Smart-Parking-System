
package smartparking.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import smartparking.entity.Booking;
import smartparking.entity.User;
import smartparking.repository.UserRepository;
import smartparking.service.BookingService;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = {
    "http://127.0.0.1:5500",
    "http://localhost:5500"
})
public class BookingController {

    private final BookingService bookingService;
    private final UserRepository userRepository;

    public BookingController(
            BookingService bookingService,
            UserRepository userRepository) {

        this.bookingService = bookingService;
        this.userRepository = userRepository;
    }

    // Create booking for authenticated customer
    @PostMapping("/create")
    public Booking createBooking(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam Long slotId,
            @RequestParam String vehicleNumber,
            @RequestParam int durationHours,
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime startTime) {

        User user = userRepository.findByEmail(
                userDetails.getUsername()
        ).orElseThrow(() ->
                new RuntimeException("Customer not found"));

        return bookingService.createBooking(
                user.getId(),
                slotId,
                vehicleNumber,
                durationHours,
                startTime
        );
    }

    // Get all bookings (Admin only)
    @GetMapping("/all")
    public List<Booking> getAllBookings() {
        return bookingService.getAllBookings();
    }

    // Get bookings of the authenticated customer
    @GetMapping("/my")
    public List<Booking> getMyBookings(
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userRepository.findByEmail(
                userDetails.getUsername()
        ).orElseThrow(() ->
                new RuntimeException("Customer not found"));

        return bookingService.getBookingsByUser(user.getId());
    }

    // Cancel booking for authenticated customer
    @DeleteMapping("/{bookingId}/cancel")
    public Booking cancelBooking(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long bookingId) {

        User user = userRepository.findByEmail(
                userDetails.getUsername()
        ).orElseThrow(() ->
                new RuntimeException("Customer not found"));

        return bookingService.cancelBooking(
                bookingId,
                user.getId()
        );
    }
}
