package com.example.simactivationportal.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.simactivationportal.entity.Customer;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    boolean existsByEmail(String email);

    boolean existsByEmailAndDateOfBirth(String email, String dateOfBirth);
    boolean existsByFirstNameAndLastNameAndEmail(
            String firstName,
            String lastName,
            String email
    );
    boolean existsByIdProofTypeAndIdProofNumber(
            String idProofType,
            String idProofNumber
    );

}