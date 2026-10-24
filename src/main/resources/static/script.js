// ================================================
// SIM ACTIVATION PORTAL
// Complete Frontend and Backend Integration
// ================================================

const API = "/api/customers";

let selectedOffer = null;
let currentCustomerId = null;
let currentCustomerEmail = null;
let currentCustomerDOB = null;
let currentSimNumber = null;

let completedSteps = {
    sim: false,
    registration: false,
    verification: false,
    address: false,
    idProof: false
};

// ================================================
// 1. PAGE NAVIGATION
// ================================================

function showPage(pageId) {
    const targetPage = document.getElementById(pageId);

    if (!targetPage) {
        console.error("Page not found: " + pageId);
        return;
    }

    document.querySelectorAll(".page").forEach(function (page) {
        page.classList.remove("active");
    });

    targetPage.classList.add("active");

    document.querySelectorAll(".nav-link").forEach(function (button) {
        button.classList.toggle(
            "active",
            button.dataset.page === pageId
        );
    });

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// ================================================
// NAVIGATION BUTTON CLICK EVENTS
// ================================================

document.querySelectorAll(".nav-link").forEach(function (button) {
    button.addEventListener("click", function (event) {
        event.preventDefault();

        const pageId = button.dataset.page;

        if (!pageId) {
            console.error("Missing data-page attribute");
            return;
        }

        if (pageId === "offers" && !completedSteps.sim) {
            showPage("sim");
            showResult("simResult", "error", "Please validate your SIM first.");
            return;
        }

        if (pageId === "register") {
            if (!completedSteps.sim) {
                showPage("sim");
                showResult("simResult", "error", "Please validate your SIM first.");
                return;
            }

            if (!selectedOffer) {
                showPage("offers");
                showResult("selectedOfferMessage", "error", "Please select a special offer first.");
                return;
            }
        }

        if (pageId === "verify" && !completedSteps.registration) {
            showPage("register");
            return;
        }

        if (pageId === "address" && !completedSteps.verification) {
            showPage("verify");
            return;
        }

        if (pageId === "idproof" && !completedSteps.address) {
            showPage("address");
            return;
        }

        if (pageId === "activation" && !completedSteps.idProof) {
            showPage("idproof");
            return;
        }

        showPage(pageId);
    });
});
// ================================================
// 2. RESULT MESSAGES
// ================================================

function showResult(elementId, type, message) {
    const element = document.getElementById(elementId);

    if (!element) {
        return;
    }

    element.textContent = message;
    element.className = "result " + type;
    element.hidden = false;
}

function clearResult(elementId) {
    const element = document.getElementById(elementId);

    if (element) {
        element.textContent = "";
        element.className = "result";
        element.hidden = true;
    }
}

// ================================================
// 3. API REQUEST
// ================================================

async function request(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            ...(options.body
                ? { "Content-Type": "application/json" }
                : {}),
            ...(options.headers || {})
        }
    });

    const text = await response.text();

    let data = text;

    if (text) {
        try {
            data = JSON.parse(text);
        } catch (error) {
            data = text;
        }
    }

    if (!response.ok) {
        let message = "Request failed. Please try again.";

        if (typeof data === "string" && data.trim()) {
            message = data;
        } else if (data && data.message) {
            message = data.message;
        } else if (data && data.error) {
            message = data.error;
        }

        throw new Error(message);
    }

    return data;
}

function queryUrl(path, params) {
    return API + path + "?" + new URLSearchParams(params).toString();
}

function getErrorMessage(error) {
    return error && error.message
        ? error.message
        : "Something went wrong. Please try again.";
}

function goToNextPage(pageId) {
    setTimeout(function () {
        showPage(pageId);
    }, 1500);
}

function isSuccessMessage(data, expectedMessage) {
    return (
        typeof data === "string" &&
        data.trim().toLowerCase() === expectedMessage.toLowerCase()
    );
}

// ================================================
// 4. HOME PAGE
// ================================================

const homeValidateSimBtn = document.getElementById(
    "homeValidateSimBtn"
);

if (homeValidateSimBtn) {
    homeValidateSimBtn.addEventListener("click", function () {
        showPage("sim");
    });
}

// ================================================
// 5. SIM VALIDATION
// GET /api/customers/validate-sim
// ================================================

const simForm = document.getElementById("simForm");

if (simForm) {
    simForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        clearResult("simResult");

        const simNumber = document
            .getElementById("simNumber")
            .value.trim();

        if (!/^[0-9]{19,20}$/.test(simNumber)) {
            completedSteps.sim = false;

            showResult(
                "simResult",
                "error",
                "Enter a valid 19 or 20 digit SIM number."
            );
            return;
        }

        const button = simForm.querySelector(
            "button[type='submit']"
        );

        button.disabled = true;
        button.textContent = "Validating...";

        try {
            const data = await request(
                queryUrl("/validate-sim", {
                    simNumber: simNumber
                })
            );

            if (
                typeof data === "string" &&
                data.toLowerCase().includes("format is valid")
            ) {
                completedSteps.sim = true;

                // Keep this SIM number separately.
                // Do not automatically copy it into registration.
                currentSimNumber = simNumber;

                showResult(
                    "simResult",
                    "success",
                    "SIM number format validated successfully!"
                );

                goToNextPage("offers");
            } else {
                completedSteps.sim = false;

                showResult(
                    "simResult",
                    "error",
                    typeof data === "string"
                        ? data
                        : "SIM validation failed."
                );
            }
        } catch (error) {
            completedSteps.sim = false;

            showResult(
                "simResult",
                "error",
                getErrorMessage(error)
            );
        } finally {
            button.disabled = false;
            button.textContent = "Validate SIM";
        }
    });
}

// ================================================
// 6. SPECIAL OFFER SELECTION
// ================================================

const offerCards = document.querySelectorAll(".offer");

offerCards.forEach(function (card) {
    card.addEventListener("click", function () {
        selectedOffer = card.dataset.offer;

        offerCards.forEach(function (offer) {
            offer.classList.remove("selected");
            offer.setAttribute("aria-pressed", "false");
        });

        card.classList.add("selected");
        card.setAttribute("aria-pressed", "true");

        showResult(
            "selectedOfferMessage",
            "success",
            "₹" + selectedOffer + " plan selected successfully!"
        );

        const continueButton = document.getElementById(
            "continueToRegister"
        );

        if (continueButton) {
            continueButton.disabled = false;
        }
    });
});

const continueToRegister = document.getElementById(
    "continueToRegister"
);

if (continueToRegister) {
    continueToRegister.addEventListener("click", function () {
        if (!selectedOffer) {
            showResult(
                "selectedOfferMessage",
                "error",
                "Please select an offer first."
            );
            return;
        }

        showPage("register");
    });
}

// ================================================
// 7. CUSTOMER REGISTRATION
// POST /api/customers/register
// ================================================

const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        clearResult("registerResult");

        const customer = {
            firstName: document.getElementById("firstName").value.trim(),
            lastName: document.getElementById("lastName").value.trim(),
            email: document.getElementById("email").value.trim(),
            mobileNumber: document.getElementById("mobileNumber").value.trim(),
            dateOfBirth: document.getElementById("dob").value,
            simNumber: document.getElementById("regSimNumber").value.trim(),
            address: document.getElementById("regAddress").value.trim(),
            idProofType: document.getElementById("idProofTypeReg").value,
            idProofNumber: document.getElementById("idProofNumberReg").value.trim()
        };

        if (!completedSteps.sim) {
            showResult(
                "registerResult",
                "error",
                "Please validate your SIM first."
            );
            return;
        }

        if (!selectedOffer) {
            showResult(
                "registerResult",
                "error",
                "Please select a special offer first."
            );
            return;
        }

        if (!/^[0-9]{19,20}$/.test(customer.simNumber)) {
            showResult(
                "registerResult",
                "error",
                "Enter a valid 19 or 20 digit SIM number."
            );
            return;
        }

        if (
            currentSimNumber &&
            customer.simNumber !== currentSimNumber
        ) {
            showResult(
                "registerResult",
                "error",
                "The registration SIM number must match the validated SIM number."
            );
            return;
        }

        const button = document.getElementById("registerBtn");

        button.disabled = true;
        button.textContent = "Registering...";

        try {
            const data = await request(API + "/register", {
                method: "POST",
                body: JSON.stringify(customer)
            });

            if (!data || !data.id) {
                throw new Error(
                    "Registration could not be confirmed. Please check your customer records."
                );
            }

            currentCustomerId = data.id;
            currentCustomerEmail = customer.email;
            currentCustomerDOB = customer.dateOfBirth;

            document.getElementById("addressCustomerId").value =
                currentCustomerId;

            document.getElementById("activationCustomerId").value =
                currentCustomerId;

            document.getElementById("verifyEmail").value =
                customer.email;

            document.getElementById("verifyDob").value =
                customer.dateOfBirth;

            document.getElementById("proofType").value =
                customer.idProofType;

            document.getElementById("proofNumber").value =
                customer.idProofNumber;

            completedSteps.registration = true;

            showResult(
                "registerResult",
                "success",
                "Registration successful! Customer ID: " +
                currentCustomerId +
                ". Your details have been saved."
            );

            goToNextPage("verify");
        } catch (error) {
            showResult(
                "registerResult",
                "error",
                getErrorMessage(error)
            );
        } finally {
            button.disabled = false;
            button.textContent = "Register Customer";
        }
    });
}

// ================================================
// 8. CUSTOMER VERIFICATION
// GET /api/customers/validate-customer
// ================================================

const verifyForm = document.getElementById("verifyForm");

if (verifyForm) {
    verifyForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        clearResult("verifyResult");

        const email = document
            .getElementById("verifyEmail")
            .value.trim();

        const dateOfBirth = document
            .getElementById("verifyDob")
            .value;

        const button = document.getElementById("verifyBtn");

        button.disabled = true;
        button.textContent = "Verifying...";

        try {
            const data = await request(
                queryUrl("/validate-customer", {
                    email: email,
                    dateOfBirth: dateOfBirth
                })
            );

            if (
                !isSuccessMessage(
                    data,
                    "Customer validation successful"
                )
            ) {
                throw new Error(
                    typeof data === "string"
                        ? data
                        : "Customer verification failed."
                );
            }

            if (
                currentCustomerEmail &&
                (
                    email.toLowerCase() !==
                        currentCustomerEmail.toLowerCase() ||
                    dateOfBirth !== currentCustomerDOB
                )
            ) {
                throw new Error(
                    "Please use the email and date of birth entered during registration."
                );
            }

            const customers = await request(API);

            const customer = customers.find(function (item) {
                return (
                    item.email &&
                    item.email.toLowerCase() === email.toLowerCase() &&
                    item.dateOfBirth === dateOfBirth
                );
            });

            if (!customer) {
                throw new Error(
                    "Customer details could not be retrieved."
                );
            }

            currentCustomerId = customer.id;
            currentCustomerEmail = email;
            currentCustomerDOB = dateOfBirth;

            document.getElementById("addressCustomerId").value =
                customer.id;

            document.getElementById("activationCustomerId").value =
                customer.id;

            completedSteps.verification = true;

            showResult(
                "verifyResult",
                "success",
                "Customer verification successful!"
            );

            goToNextPage("address");
        } catch (error) {
            completedSteps.verification = false;

            showResult(
                "verifyResult",
                "error",
                getErrorMessage(error)
            );
        } finally {
            button.disabled = false;
            button.textContent = "Verify Customer";
        }
    });
}

// ================================================
// 9. UPDATE CUSTOMER ADDRESS
// PUT /api/customers/{id}/address
// ================================================

const addressForm = document.getElementById("addressForm");

if (addressForm) {
    addressForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        clearResult("addressResult");

        const customerId = document
            .getElementById("addressCustomerId")
            .value.trim();

        const address = document
            .getElementById("newAddress")
            .value.trim();

        if (!completedSteps.verification) {
            showResult(
                "addressResult",
                "error",
                "Please verify the customer first."
            );
            return;
        }

        if (
            currentCustomerId &&
            Number(customerId) !== Number(currentCustomerId)
        ) {
            showResult(
                "addressResult",
                "error",
                "Enter the verified Customer ID."
            );
            return;
        }

        if (!address) {
            showResult(
                "addressResult",
                "error",
                "Please enter the new address."
            );
            return;
        }

        const button = document.getElementById("updateAddressBtn");

        button.disabled = true;
        button.textContent = "Updating...";

        try {
            const data = await request(
                queryUrl(
                    "/" + encodeURIComponent(customerId) + "/address",
                    { address: address }
                ),
                { method: "PUT" }
            );

            if (!data || !data.id) {
                throw new Error(
                    "Address update could not be confirmed."
                );
            }

            completedSteps.address = true;

            showResult(
                "addressResult",
                "success",
                "Address Updated Successfully!"
            );

            goToNextPage("idproof");
        } catch (error) {
            completedSteps.address = false;

            showResult(
                "addressResult",
                "error",
                getErrorMessage(error)
            );
        } finally {
            button.disabled = false;
            button.textContent = "Update Address";
        }
    });
}

// ================================================
// 10. ID PROOF VALIDATION
// GET /api/customers/validate-id-proof
// ================================================

const idProofForm = document.getElementById("idProofForm");

if (idProofForm) {
    idProofForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        clearResult("proofResult");

        if (!completedSteps.address) {
            showResult(
                "proofResult",
                "error",
                "Please complete the address update first."
            );
            return;
        }

        const idProofType = document
            .getElementById("proofType")
            .value;

        const idProofNumber = document
            .getElementById("proofNumber")
            .value.trim();

        const button = document.getElementById(
            "validateIdProofBtn"
        );

        button.disabled = true;
        button.textContent = "Validating...";

        try {
            const data = await request(
                queryUrl("/validate-id-proof", {
                    idProofType: idProofType,
                    idProofNumber: idProofNumber
                })
            );

            if (
                !isSuccessMessage(
                    data,
                    "ID proof validation successful"
                )
            ) {
                throw new Error(
                    typeof data === "string"
                        ? data
                        : "ID proof validation failed."
                );
            }

            if (!currentCustomerId) {
                throw new Error(
                    "Customer registration details are missing."
                );
            }

            const customers = await request(API);

            const customer = customers.find(function (item) {
                return Number(item.id) === Number(currentCustomerId);
            });

            if (
                !customer ||
                customer.idProofType !== idProofType ||
                customer.idProofNumber !== idProofNumber
            ) {
                throw new Error(
                    "ID proof does not match the registered customer."
                );
            }

            completedSteps.idProof = true;

            showResult(
                "proofResult",
                "success",
                "ID Proof Validation Successful!"
            );

            goToNextPage("activation");
        } catch (error) {
            completedSteps.idProof = false;

            showResult(
                "proofResult",
                "error",
                getErrorMessage(error)
            );
        } finally {
            button.disabled = false;
            button.textContent = "Validate ID Proof";
        }
    });
}

// ================================================
// 11. SIM ACTIVATION - FINAL STEP
// PUT /api/customers/{id}/activate
// ================================================

const activationForm = document.getElementById("activationForm");

if (activationForm) {
    activationForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        clearResult("activationResult");

        if (
            !completedSteps.sim ||
            !completedSteps.registration ||
            !completedSteps.verification ||
            !completedSteps.address ||
            !completedSteps.idProof
        ) {
            showResult(
                "activationResult",
                "error",
                "Please complete all previous steps before activating your SIM."
            );
            return;
        }

        const customerId = document
            .getElementById("activationCustomerId")
            .value.trim();

        if (
            !customerId ||
            Number(customerId) < 1 ||
            !Number.isInteger(Number(customerId))
        ) {
            showResult(
                "activationResult",
                "error",
                "Please enter a valid Customer ID."
            );
            return;
        }

        if (
            currentCustomerId &&
            Number(customerId) !== Number(currentCustomerId)
        ) {
            showResult(
                "activationResult",
                "error",
                "Enter the verified Customer ID."
            );
            return;
        }

        const button = document.getElementById("activateSimBtn");

        button.disabled = true;
        button.textContent = "Activating...";

        try {
            const data = await request(
                API + "/" +
                encodeURIComponent(customerId) +
                "/activate",
                { method: "PUT" }
            );

            if (!data || !data.id) {
                throw new Error(
                    "SIM activation could not be confirmed."
                );
            }

            if (data.activationStatus !== "ACTIVE") {
                throw new Error(
                    "SIM activation was not confirmed by the server."
                );
            }

            showResult(
                "activationResult",
                "success",
                "SIM Activated Successfully! Your SIM status is ACTIVE."
            );
        } catch (error) {
            showResult(
                "activationResult",
                "error",
                getErrorMessage(error)
            );
        } finally {
            button.disabled = false;
            button.textContent = "Activate SIM";
        }
    });
}