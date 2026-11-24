
package smartparking.security;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        http
            .csrf(csrf -> csrf.disable())

            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            .formLogin(form -> form.disable())
            .httpBasic(basic -> basic.disable())

            .authorizeHttpRequests(auth -> auth

                // Customer and admin login/signup
                .requestMatchers("/api/auth/**").permitAll()

                // Public parking information
                .requestMatchers(HttpMethod.GET, "/api/parking/**").permitAll()

                // Only admins can update parking slots
                .requestMatchers(
                    HttpMethod.PUT,
                    "/api/parking/slots/*/status"
                ).hasRole("ADMIN")

                // Only customers can create bookings
                .requestMatchers(
                    HttpMethod.POST,
                    "/api/bookings/create"
                ).hasRole("CUSTOMER")

                // Only admins can see all bookings
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/bookings/all"
                ).hasRole("ADMIN")

                // Logged-in customers can access booking history
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/bookings/my"
                ).hasRole("CUSTOMER")

                // Allow only authenticated customers to cancel their own bookings
                .requestMatchers(
                    HttpMethod.DELETE,
                    "/api/bookings/*/cancel"
                ).hasRole("CUSTOMER")

                // Everything else requires authentication
                .anyRequest().authenticated()
            )

            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(List.of(
            "http://127.0.0.1:5500",
            "http://localhost:5500"
        ));

        configuration.setAllowedMethods(List.of(
            "GET", "POST", "PUT", "DELETE", "OPTIONS"
        ));

        configuration.setAllowedHeaders(List.of(
            "Authorization", "Content-Type"
        ));

        configuration.setAllowCredentials(false);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}
