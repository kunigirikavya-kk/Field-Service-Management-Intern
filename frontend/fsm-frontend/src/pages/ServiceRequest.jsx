import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./ServiceRequest.css";

import {
    getCustomers,
    createServiceRequest,
    uploadServiceRequestPhoto
} from "../services/api";


function ServiceRequest() {

    const navigate = useNavigate();


    // =====================================================
    // LOGGED-IN USER
    // =====================================================

    const storedUser =
        localStorage.getItem("fieldsyncUser");

    let currentUser = null;

    try {

        currentUser =
            storedUser
                ? JSON.parse(storedUser)
                : null;

    } catch (error) {

        console.error(
            "Unable to read logged-in user:",
            error
        );

    }


    const currentUserRole =
        String(
            currentUser?.role || ""
        ).toUpperCase();


    const isCustomer =
        currentUserRole === "CUSTOMER";


    const isTechnician =
        currentUserRole === "TECHNICIAN";


    const canCreateForCustomer =
        currentUserRole === "DISPATCHER" ||
        currentUserRole === "MANAGER";


    // =====================================================
    // STATE
    // =====================================================

    const [customers, setCustomers] =
        useState([]);


    const [loadingCustomers, setLoadingCustomers] =
        useState(false);


    const [submitting, setSubmitting] =
        useState(false);

    const [requestImages, setRequestImages] =
        useState([]);


    const [formData, setFormData] =
        useState({

            customerId: "",

            title: "",

            serviceType: "",

            priority: "",

            preferredDate: "",

            serviceLocation: "",

            description: ""

        });


    // =====================================================
    // LOAD PAGE
    // =====================================================

    useEffect(() => {

        // -------------------------------------------------
        // TECHNICIAN
        // -------------------------------------------------

        if (isTechnician) {

            navigate("/dashboard");

            return;

        }


        // -------------------------------------------------
        // CUSTOMER
        // -------------------------------------------------

        if (isCustomer) {

            /*
             * IMPORTANT:
             *
             * CUSTOMER must NOT call:
             *
             * GET /api/customers
             *
             * because that endpoint is intentionally restricted
             * to DISPATCHER and MANAGER.
             *
             * The logged-in customer's user ID is used instead.
             *
             * ServiceRequestService already supports resolving
             * users.id -> customers.id using findByUserId().
             */

            const loggedInUserId =
                currentUser?.id;


            if (!loggedInUserId) {

                console.error(
                    "❌ Logged-in customer user ID not found."
                );

                alert(
                    "Unable to identify your customer account. Please login again."
                );

                navigate("/login");

                return;

            }


            console.log(
                "👤 CUSTOMER USER ID:",
                loggedInUserId
            );


            setFormData(prev => ({

                ...prev,

                customerId:
                    String(loggedInUserId)

            }));


            return;

        }


        // -------------------------------------------------
        // DISPATCHER / MANAGER
        // -------------------------------------------------

        if (!canCreateForCustomer) {

            navigate("/dashboard");

            return;

        }


        // -------------------------------------------------
        // LOAD CUSTOMER LIST
        // -------------------------------------------------

        const loadCustomers =
            async () => {

                try {

                    setLoadingCustomers(true);


                    const data =
                        await getCustomers();


                    console.log(
                        "👥 CUSTOMERS LOADED:",
                        data
                    );


                    setCustomers(
                        Array.isArray(data)
                            ? data
                            : []
                    );


                } catch (error) {

                    console.error(
                        "❌ Error loading customers:",
                        error
                    );


                    const message =
                        error?.message || "";


                    if (
                        message.includes("401")
                    ) {

                        handleSessionExpired();

                    } else {

                        alert(
                            "Failed to load customers."
                        );

                    }

                } finally {

                    setLoadingCustomers(false);

                }

            };


        loadCustomers();

    }, [
        isCustomer,
        isTechnician,
        canCreateForCustomer,
        navigate
    ]);


    // =====================================================
    // SESSION EXPIRED
    // =====================================================

    function handleSessionExpired() {

        localStorage.removeItem(
            "fieldsyncToken"
        );


        localStorage.removeItem(
            "fieldsyncAuthenticated"
        );


        localStorage.removeItem(
            "fieldsyncUser"
        );


        alert(
            "Your session has expired. Please login again."
        );


        navigate("/login");

    }


    // =====================================================
    // HANDLE INPUT CHANGE
    // =====================================================

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;


        setFormData(prev => ({

            ...prev,

            [name]: value

        }));

    };


    const handleImageChange = (e) => {
        const files = Array.from(e.target.files || []);
        const validImages = files.filter(file =>
            file.type.startsWith("image/") &&
            file.size <= 10 * 1024 * 1024
        );

        if (files.length !== validImages.length) {
            alert("Only image files up to 10 MB each are allowed.");
        }

        setRequestImages(validImages.slice(0, 5));
        e.target.value = "";
    };

    // =====================================================
    // CREATE SERVICE REQUEST
    // =====================================================

    const handleSubmit =
        async (e) => {

            e.preventDefault();


            if (submitting) {

                return;

            }


            // -------------------------------------------------
            // CHECK TOKEN
            // -------------------------------------------------

            const token =
                localStorage.getItem(
                    "fieldsyncToken"
                );


            if (!token) {

                handleSessionExpired();

                return;

            }


            // -------------------------------------------------
            // CHECK ROLE
            // -------------------------------------------------

            if (
                !isCustomer &&
                !canCreateForCustomer
            ) {

                alert(
                    "You do not have permission to create a service request."
                );

                return;

            }


            // -------------------------------------------------
            // CUSTOMER ID
            // -------------------------------------------------

            const customerId =
                formData.customerId;


            if (!customerId) {

                alert(
                    isCustomer
                        ? "Unable to identify your customer account."
                        : "Please select a customer."
                );

                return;

            }


            // -------------------------------------------------
            // TITLE
            // -------------------------------------------------

            if (!formData.title.trim()) {

                alert(
                    "Please enter a service request title."
                );

                return;

            }


            // -------------------------------------------------
            // SERVICE TYPE
            // -------------------------------------------------

            if (!formData.serviceType) {

                alert(
                    "Please select a service type."
                );

                return;

            }


            // -------------------------------------------------
            // PRIORITY
            // -------------------------------------------------

            if (!formData.priority) {

                alert(
                    "Please select a priority."
                );

                return;

            }


            // -------------------------------------------------
            // PREFERRED DATE
            // -------------------------------------------------

            if (!formData.preferredDate) {

                alert(
                    "Please select a preferred date."
                );

                return;

            }


            // -------------------------------------------------
            // LOCATION
            // -------------------------------------------------

            if (!formData.serviceLocation.trim()) {

                alert(
                    "Please enter the service location."
                );

                return;

            }


            // -------------------------------------------------
            // DESCRIPTION
            // -------------------------------------------------

            if (!formData.description.trim()) {

                alert(
                    "Please enter a problem description."
                );

                return;

            }


            if (isCustomer && requestImages.length === 0) {
                alert("Please upload at least one image showing the service issue.");
                return;
            }

            // =================================================
            // REQUEST DATA
            // =================================================

            const requestData = {

                /*
                 * CUSTOMER:
                 * this is users.id.
                 *
                 * Backend ServiceRequestService will resolve
                 * it to customers.id using findByUserId().
                 *
                 * DISPATCHER / MANAGER:
                 * this is customers.id selected from dropdown.
                 */

                customerId:
                    Number(customerId),

                title:
                    formData.title.trim(),

                serviceType:
                    formData.serviceType,

                priority:
                    formData.priority,

                preferredDate:
                    formData.preferredDate,

                serviceLocation:
                    formData.serviceLocation.trim(),

                description:
                    formData.description.trim()

            };


            console.log(
                "📤 SENDING SERVICE REQUEST:",
                requestData
            );


            // =================================================
            // SAVE
            // =================================================

            try {

                setSubmitting(true);


                const result =
                    await createServiceRequest(
                        requestData
                    );


                console.log(
                    "✅ SERVICE REQUEST CREATED:",
                    result
                );

                if (requestImages.length > 0 && result?.id) {
                    const uploadResults = await Promise.allSettled(
                        requestImages.map(file =>
                            uploadServiceRequestPhoto(file, result.id)
                        )
                    );

                    const failedUploads = uploadResults.filter(
                        item => item.status === "rejected"
                    );

                    if (failedUploads.length > 0) {
                        throw new Error(
                            "The service request was created, but one or more images could not be uploaded."
                        );
                    }
                }


                alert(
                    "Service request created successfully! 🎉"
                );


                // -------------------------------------------------
                // RESET
                // -------------------------------------------------

                setFormData({

                    customerId:
                        isCustomer
                            ? String(currentUser?.id || "")
                            : "",

                    title: "",

                    serviceType: "",

                    priority: "",

                    preferredDate: "",

                    serviceLocation: "",

                    description: ""

                });

                setRequestImages([]);


                // -------------------------------------------------
                // DASHBOARD
                // -------------------------------------------------

                navigate("/dashboard");

            } catch (error) {

                console.error(
                    "❌ ERROR CREATING SERVICE REQUEST:",
                    error
                );


                const message =
                    error?.message || "";


                if (
                    message.includes("401")
                ) {

                    handleSessionExpired();

                    return;

                }


                if (
                    message.includes("403")
                ) {

                    alert(
                        "You are logged in, but your account does not have permission to create this service request."
                    );

                    return;

                }


                alert(
                    `Failed to create service request.\n\n${message}`
                );

            } finally {

                setSubmitting(false);

            }

        };


    // =====================================================
    // UI
    // =====================================================

    return (

        <div className="service-request-page">


            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="page-heading">

                <div>

                    <div className="inventory-inspired-title-row">
                        <div className="inventory-inspired-icon">✦</div>
                        <div>
                            <span className="inventory-inspired-eyebrow">SERVICE REQUESTS • FIELDSYNC</span>

                            <h1>
                                New Service Request
                            </h1>

                            <p>
                                {isCustomer
                                    ? "Create a new service request for your account."
                                    : "Create a new service request for a customer."}
                            </p>
                        </div>
                    </div>

                </div>

            </div>


            {/* =================================================
                CARD
            ================================================= */}

            <div className="service-request-card">

                <form
                    onSubmit={handleSubmit}
                >

                    <div className="form-grid">


                        {/* =================================================
                            CUSTOMER
                        ================================================= */}

                        <div className="form-group">

                            <label>
                                Customer
                            </label>


                            {isCustomer ? (

                                /*
                                 * CUSTOMER:
                                 * Do NOT show a customer dropdown.
                                 *
                                 * The logged-in customer's account is
                                 * automatically selected.
                                 */

                                <input
                                    type="text"
                                    value={
                                        currentUser?.companyName ||
                                        currentUser?.fullName ||
                                        currentUser?.name ||
                                        currentUser?.email ||
                                        "Your Customer Account"
                                    }
                                    disabled
                                />

                            ) : (

                                /*
                                 * DISPATCHER / MANAGER:
                                 * Show the customer dropdown.
                                 */

                                <select
                                    name="customerId"
                                    value={
                                        formData.customerId
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                    disabled={
                                        loadingCustomers
                                    }
                                >

                                    <option value="">

                                        {loadingCustomers
                                            ? "Loading Customers..."
                                            : "Select Customer"}

                                    </option>


                                    {customers.map(
                                        customer => (

                                            <option
                                                key={
                                                    customer.id
                                                }
                                                value={
                                                    customer.id
                                                }
                                            >

                                                {
                                                    customer.companyName ||
                                                    customer.fullName ||
                                                    customer.name ||
                                                    customer.email ||
                                                    `Customer #${customer.id}`
                                                }

                                            </option>

                                        )
                                    )}

                                </select>

                            )}

                        </div>


                        {/* =================================================
                            SERVICE TYPE
                        ================================================= */}

                        <div className="form-group">

                            <label>
                                Service Type
                            </label>


                            <select
                                name="serviceType"
                                value={
                                    formData.serviceType
                                }
                                onChange={
                                    handleChange
                                }
                                required
                            >

                                <option value="">
                                    Select Service Type
                                </option>

                                <option value="AC Maintenance">
                                    AC Maintenance
                                </option>

                                <option value="Equipment Repair">
                                    Equipment Repair
                                </option>

                                <option value="System Inspection">
                                    System Inspection
                                </option>

                                <option value="Installation">
                                    Installation
                                </option>

                                <option value="Electrical Maintenance">
                                    Electrical Maintenance
                                </option>

                                <option value="Plumbing Repair">
                                    Plumbing Repair
                                </option>

                                <option value="Preventive Maintenance">
                                    Preventive Maintenance
                                </option>

                            </select>

                        </div>


                        {/* =================================================
                            PREFERRED DATE
                        ================================================= */}

                        <div className="form-group">

                            <label>
                                Preferred Date
                            </label>


                            <input
                                type="date"
                                name="preferredDate"
                                value={
                                    formData.preferredDate
                                }
                                onChange={
                                    handleChange
                                }
                                required
                            />

                        </div>


                        {/* =================================================
                            TITLE
                        ================================================= */}

                        <div className="form-group">

                            <label>
                                Service Request Title
                            </label>


                            <input
                                type="text"
                                name="title"
                                value={
                                    formData.title
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Enter service request title"
                                maxLength="150"
                                required
                            />

                        </div>


                        {/* =================================================
                            PRIORITY
                        ================================================= */}

                        <div className="form-group">

                            <label>
                                Priority
                            </label>


                            <select
                                name="priority"
                                value={
                                    formData.priority
                                }
                                onChange={
                                    handleChange
                                }
                                required
                            >

                                <option value="">
                                    Select Priority
                                </option>

                                <option value="LOW">
                                    Low
                                </option>

                                <option value="MEDIUM">
                                    Medium
                                </option>

                                <option value="HIGH">
                                    High
                                </option>

                                <option value="URGENT">
                                    Urgent
                                </option>

                            </select>

                        </div>


                        {/* =================================================
                            SERVICE LOCATION
                        ================================================= */}

                        <div className="form-group">

                            <label>
                                Service Location
                            </label>


                            <input
                                type="text"
                                name="serviceLocation"
                                value={
                                    formData.serviceLocation
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Enter service location"
                                required
                            />

                        </div>


                        {/* =================================================
                            DESCRIPTION
                        ================================================= */}

                        <div className="form-group full-width">

                            <label>
                                Problem Description
                            </label>


                            <textarea
                                name="description"
                                value={
                                    formData.description
                                }
                                onChange={
                                    handleChange
                                }
                                rows="5"
                                placeholder="Describe the service requirement..."
                                required
                            />

                        </div>

                        {/* =================================================
                            SERVICE ISSUE IMAGES
                        ================================================= */}

                        <div className="form-group full-width">

                            <label>
                                Service Issue Images <span style={{ color: "#c45b3c" }}>*</span>
                            </label>

                            <div className="service-request-upload">
                                <input
                                    id="service-request-images"
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageChange}
                                    disabled={submitting}
                                />

                                <label htmlFor="service-request-images" className="service-request-upload-label">
                                    📷 Choose Images
                                </label>

                                <span className="service-request-upload-hint">
                                    Upload up to 5 images • JPG / PNG / WEBP • Max 10 MB each
                                </span>
                            </div>

                            {requestImages.length > 0 && (
                                <div className="service-request-image-preview">
                                    {requestImages.map((file, index) => (
                                        <div className="service-request-image-item" key={file.name + index}>
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={"Service issue " + (index + 1)}
                                            />
                                            <span>{file.name}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>


                    {/* =================================================
                        ACTION BUTTONS
                    ================================================= */}

                    <div className="form-actions">

                        <button
                            type="button"
                            className="cancel-button"
                            onClick={() =>
                                navigate(
                                    "/dashboard"
                                )
                            }
                            disabled={
                                submitting
                            }
                        >

                            Cancel

                        </button>


                        <button
                            type="submit"
                            className="primary-button"
                            disabled={
                                submitting ||
                                loadingCustomers
                            }
                        >

                            {submitting
                                ? "Creating..."
                                : "Create Service Request"}

                        </button>

                    </div>

                </form>

            </div>

        </div>

    );

}


export default ServiceRequest;