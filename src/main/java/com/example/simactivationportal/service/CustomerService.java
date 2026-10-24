package com.example.simactivationportal.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.simactivationportal.entity.Customer;
import com.example.simactivationportal.repository.CustomerRepository;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {

        this.customerRepository = customerRepository;

    }

    // 1. Register Customer

    public Customer registerCustomer(Customer customer) {

        if (customer.getEmail() == null
                || customer.getEmail().isBlank()) {

            throw new IllegalArgumentException("Email is required");

        }

        if (customerRepository.existsByEmail(customer.getEmail())) {

            throw new IllegalArgumentException("Email already registered");

        }

        customer.setActivationStatus("PENDING");

        return customerRepository.save(customer);

    }

    // 2. Get All Customers

    public List<Customer> getAllCustomers() {

        return customerRepository.findAll();

    }

    // 3. Get Customer By ID

    public Customer getCustomerById(Long id) {

        return customerRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Customer not found"));

    }

    // 4. SIM Card Number Validation

    public String validateSim(String simNumber) {

        if (simNumber == null || simNumber.isBlank()) {

            return "SIM card number is required";

        }

        if (!simNumber.matches("\\d{19,20}")) {

            return "Invalid SIM card number. Enter 19 or 20 digits";

        }

        return "SIM card number format is valid";

    }

    // 5. Get Special Offers

    public List<String> getSpecialOffers() {

        return List.of(

                "Offer 1: Unlimited Calls + 1.5GB Data/day - Rs.299 - 28 Days",

                "Offer 2: Unlimited Calls + 2GB Data/day - Rs.399 - 28 Days",

                "Offer 3: Unlimited Calls + 3GB Data/day - Rs.499 - 56 Days"

        );

    }

    // 6. Validate Customer using Email and Date of Birth

    public String validateCustomer(String email, String dateOfBirth) {

        if (email == null || email.isBlank()
                || dateOfBirth == null || dateOfBirth.isBlank()) {

            return "Email and Date of Birth are required";

        }

        boolean valid = customerRepository
                .existsByEmailAndDateOfBirth(email, dateOfBirth);

        if (valid) {

            return "Customer validation successful";

        }

        return "Invalid Email or Date of Birth";

    }

    // 7. Validate Customer Details

    public String validateCustomerDetails(
            String firstName,
            String lastName,
            String email) {

        if (firstName == null || firstName.isBlank()
                || lastName == null || lastName.isBlank()
                || email == null || email.isBlank()) {

            return "First Name, Last Name and Email are required";

        }

        boolean valid = customerRepository
                .existsByFirstNameAndLastNameAndEmail(
                        firstName, lastName, email);

        if (valid) {

            return "Customer details validation successful";

        }

        return "Invalid customer details";

    }

    // 8. Update Customer Address

    public Customer updateAddress(Long id, String newAddress) {

        Customer customer = customerRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Customer not found"));

        if (newAddress == null || newAddress.isBlank()) {

            throw new IllegalArgumentException("Address is required");

        }

        customer.setAddress(newAddress);

        return customerRepository.save(customer);

    }

    // 9. Validate Customer ID Proof

    public String validateIdProof(
            String idProofType,
            String idProofNumber) {

        if (idProofType == null || idProofType.isBlank()
                || idProofNumber == null || idProofNumber.isBlank()) {

            return "ID proof type and number are required";

        }

        boolean valid = customerRepository
                .existsByIdProofTypeAndIdProofNumber(
                        idProofType, idProofNumber);

        if (valid) {

            return "ID proof validation successful";

        }

        return "Invalid ID proof details";

    }

    // 10. Activate SIM

    public Customer activateSim(Long id) {

        Customer customer = customerRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Customer not found"));

        if (customer.getSimNumber() == null
                || customer.getSimNumber().isBlank()) {

            throw new IllegalArgumentException(
                    "SIM number is required");

        }

        if (customer.getIdProofType() == null
                || customer.getIdProofNumber() == null
                || customer.getIdProofType().isBlank()
                || customer.getIdProofNumber().isBlank()) {

            throw new IllegalArgumentException(
                    "Valid ID proof details are required");

        }

        if (!customer.getSimNumber().matches("\\d{19,20}")) {

            throw new IllegalArgumentException(
                    "Invalid SIM number. Enter 19 or 20 digits");

        }

        customer.setActivationStatus("ACTIVE");

        return customerRepository.save(customer);

    }

    // 11. Update Customer Details

    public Customer updateCustomerDetails(
            Long id,
            Customer updatedCustomer) {

        Customer customer = customerRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Customer not found"));

        if (updatedCustomer.getDateOfBirth() == null
                || updatedCustomer.getDateOfBirth().isBlank()) {

            throw new IllegalArgumentException(
                    "Date of Birth is required");

        }

        if (updatedCustomer.getSimNumber() == null
                || updatedCustomer.getSimNumber().isBlank()) {

            throw new IllegalArgumentException(
                    "SIM number is required");

        }

        if (updatedCustomer.getIdProofType() == null
                || updatedCustomer.getIdProofType().isBlank()
                || updatedCustomer.getIdProofNumber() == null
                || updatedCustomer.getIdProofNumber().isBlank()) {

            throw new IllegalArgumentException(
                    "ID proof type and number are required");

        }

        if (!updatedCustomer.getSimNumber().matches("\\d{19,20}")) {

            throw new IllegalArgumentException(
                    "Invalid SIM number. Enter 19 or 20 digits");

        }

        customer.setDateOfBirth(updatedCustomer.getDateOfBirth());

        customer.setSimNumber(updatedCustomer.getSimNumber());

        customer.setIdProofType(updatedCustomer.getIdProofType());

        customer.setIdProofNumber(updatedCustomer.getIdProofNumber());

        return customerRepository.save(customer);

    }

}