
package smartparking.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import smartparking.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByRole(String role);
}
