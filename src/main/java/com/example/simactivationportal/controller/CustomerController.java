package com.example.simactivationportal.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.simactivationportal.entity.Customer;
import com.example.simactivationportal.service.CustomerService;

@RestController

@RequestMapping("/api/customers")

@CrossOrigin(origins = "*")

public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {

        this.customerService = customerService;

    }

    // 1. Register Customer

    @PostMapping("/register")

    public ResponseEntity<?> registerCustomer(

            @RequestBody Customer customer) {

        try {

            Customer savedCustomer =
                    customerService.registerCustomer(customer);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(savedCustomer);

        } catch (IllegalArgumentException e) {

            return ResponseEntity.badRequest()
                    .body(e.getMessage());

        }

    }

    // 2. Get All Customers

    @GetMapping

    public ResponseEntity<List<Customer>> getAllCustomers() {

        return ResponseEntity.ok(
                customerService.getAllCustomers());

    }

    // 3. Get Customer By ID

    @GetMapping("/{id}")

    public ResponseEntity<?> getCustomerById(

            @PathVariable Long id) {

        try {

            return ResponseEntity.ok(
                    customerService.getCustomerById(id));

        } catch (RuntimeException e) {

            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());

        }

    }

    // 4. SIM Card Number Validation

    @GetMapping("/validate-sim")

    public ResponseEntity<String> validateSim(

            @RequestParam(name = "simNumber") String simNumber) {

        if (simNumber == null || simNumber.trim().isEmpty()) {

            return ResponseEntity.badRequest()
                    .body("Please enter SIM ICCID number");

        }

        String result = customerService.validateSim(simNumber.trim());

        return ResponseEntity.ok(result);

    }

    // 5. Validate Customer using Email and Date of Birth

    @GetMapping("/validate-customer")

    public ResponseEntity<String> validateCustomer(

            @RequestParam String email,

            @RequestParam String dateOfBirth) {

        String result = customerService.validateCustomer(
                email, dateOfBirth);

        if (result.equals("Customer validation successful")) {

            return ResponseEntity.ok(result);

        }

        return ResponseEntity.badRequest().body(result);

    }

    // 6. Validate Customer Details

    @GetMapping("/validate-details")

    public ResponseEntity<String> validateCustomerDetails(

            @RequestParam String firstName,

            @RequestParam String lastName,

            @RequestParam String email) {

        String result = customerService.validateCustomerDetails(
                firstName, lastName, email);

        if (result.equals("Customer details validation successful")) {

            return ResponseEntity.ok(result);

        }

        return ResponseEntity.badRequest().body(result);

    }

    // 7. Update Customer Address

    @PutMapping("/{id}/address")

    public ResponseEntity<?> updateAddress(

            @PathVariable Long id,

            @RequestParam String address) {

        try {

            Customer updatedCustomer =
                    customerService.updateAddress(id, address);

            return ResponseEntity.ok(updatedCustomer);

        } catch (IllegalArgumentException e) {

            return ResponseEntity.badRequest().body(e.getMessage());

        } catch (RuntimeException e) {

            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());

        }

    }

    // 8. Validate Customer ID Proof

    @GetMapping("/validate-id-proof")

    public ResponseEntity<String> validateIdProof(

            @RequestParam String idProofType,

            @RequestParam String idProofNumber) {

        String result = customerService.validateIdProof(
                idProofType, idProofNumber);

        if (result.equals("ID proof validation successful")) {

            return ResponseEntity.ok(result);

        }

        return ResponseEntity.badRequest().body(result);

    }

    // 9. Activate SIM

    @PutMapping("/{id}/activate")

    public ResponseEntity<?> activateSim(@PathVariable Long id) {

        try {

            Customer customer = customerService.activateSim(id);

            return ResponseEntity.ok(customer);

        } catch (IllegalArgumentException e) {

            return ResponseEntity.badRequest().body(e.getMessage());

        } catch (RuntimeException e) {

            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());

        }

    }

    // 10. Update Customer Details

    @PutMapping("/{id}/details")

    public ResponseEntity<Customer> updateCustomerDetails(

            @PathVariable Long id,

            @RequestBody Customer customer) {

        Customer updatedCustomer =
                customerService.updateCustomerDetails(id, customer);

        return ResponseEntity.ok(updatedCustomer);

    }
    // 11. Get Special Offers

    @GetMapping("/offers")

    public ResponseEntity<List<String>> getSpecialOffers() {

        return ResponseEntity.ok(
                customerService.getSpecialOffers());

    }

}
