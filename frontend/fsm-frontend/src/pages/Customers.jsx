import { useEffect, useState } from "react";
import {
    createCustomer,
    getCustomers,
    getSites,
    createSite
} from "../services/api";

import "./Customers.css";

function Customers() {

    const [customers, setCustomers] = useState([]);
    const [sites, setSites] = useState({});
    const [loading, setLoading] = useState(true);

    const [expandedCustomer, setExpandedCustomer] = useState(null);
    const [showSiteForm, setShowSiteForm] = useState(null);

    // =====================================================
    // CUSTOMER FORM
    // =====================================================

    const [customerForm, setCustomerForm] = useState({
        companyName: "",
        contactPerson: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zipCode: ""
    });

    // =====================================================
    // SITE FORM
    // =====================================================

    const [siteForm, setSiteForm] = useState({
        siteName: "",
        contactPerson: "",
        contactPhone: "",
        address: "",
        city: "",
        state: "",
        zipCode: ""
    });

    // =====================================================
    // LOAD CUSTOMERS
    // =====================================================

    const loadCustomers = async () => {

        try {

            setLoading(true);

            const data = await getCustomers();

            const customerData =
                Array.isArray(data)
                    ? data
                    : data
                        ? [data]
                        : [];

            setCustomers(customerData);

        } catch (error) {

            console.error(
                "Failed to load customers:",
                error
            );

        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {

        loadCustomers();

    }, []);

    // =====================================================
    // CUSTOMER INPUT
    // =====================================================

    const handleCustomerChange = (event) => {

        setCustomerForm({
            ...customerForm,
            [event.target.name]: event.target.value
        });
    };

    // =====================================================
    // CREATE CUSTOMER
    // =====================================================

    const handleCustomerSubmit = async (event) => {

        event.preventDefault();

        try {

            await createCustomer(customerForm);

            setCustomerForm({
                companyName: "",
                contactPerson: "",
                email: "",
                phone: "",
                address: "",
                city: "",
                state: "",
                zipCode: ""
            });

            await loadCustomers();

            alert("Customer created successfully!");

        } catch (error) {

            console.error(
                "Failed to create customer:",
                error
            );

            alert(
                "Failed to create customer."
            );
        }
    };

    // =====================================================
    // LOAD SITES
    // =====================================================

    const loadSites = async (customerId) => {

        try {

            const data =
                await getSites(customerId);

            setSites((previous) => ({
                ...previous,
                [customerId]:
                    Array.isArray(data)
                        ? data
                        : data
                            ? [data]
                            : []
            }));

        } catch (error) {

            console.error(
                "Failed to load sites:",
                error
            );

            setSites((previous) => ({
                ...previous,
                [customerId]: []
            }));
        }
    };

    // =====================================================
    // TOGGLE CUSTOMER SITES
    // =====================================================

    const toggleSites = async (customerId) => {

        if (expandedCustomer === customerId) {

            setExpandedCustomer(null);

            return;
        }

        setExpandedCustomer(customerId);

        await loadSites(customerId);
    };

    // =====================================================
    // SITE INPUT
    // =====================================================

    const handleSiteChange = (event) => {

        setSiteForm({
            ...siteForm,
            [event.target.name]: event.target.value
        });
    };

    // =====================================================
    // CREATE SITE
    // =====================================================

    const handleSiteSubmit = async (
        event,
        customerId
    ) => {

        event.preventDefault();

        try {

            await createSite(
                customerId,
                siteForm
            );

            setSiteForm({
                siteName: "",
                contactPerson: "",
                contactPhone: "",
                address: "",
                city: "",
                state: "",
                zipCode: ""
            });

            setShowSiteForm(null);

            await loadSites(customerId);

            alert(
                "Site created successfully!"
            );

        } catch (error) {

            console.error(
                "Failed to create site:",
                error
            );

            alert(
                "Failed to create site."
            );
        }
    };

    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className="customer-page">

            {/* HEADER */}

            <div className="customer-header">

                <div className="inventory-inspired-title-row">
                    <div className="inventory-inspired-icon">♙</div>
                    <div>
                        <span className="inventory-inspired-eyebrow">CUSTOMERS • FIELDSYNC</span>

                        <h1>
                            Customer Management
                        </h1>

                        <p>
                            Manage customers, their sites
                            and contact information
                        </p>
                    </div>
                </div>

            </div>

            {/* ADD CUSTOMER */}

            <div className="customer-card">

                <div className="card-title">

                    <h2>
                        Add New Customer
                    </h2>

                    <p>
                        Enter the customer details below
                    </p>

                </div>

                <form
                    onSubmit={handleCustomerSubmit}
                >

                    <div className="form-grid">

                        <div className="form-group">

                            <label>
                                Company Name
                            </label>

                            <input
                                name="companyName"
                                placeholder="Enter company name"
                                value={
                                    customerForm.companyName
                                }
                                onChange={
                                    handleCustomerChange
                                }
                                required
                            />

                        </div>

                        <div className="form-group">

                            <label>
                                Contact Person
                            </label>

                            <input
                                name="contactPerson"
                                placeholder="Enter contact person"
                                value={
                                    customerForm.contactPerson
                                }
                                onChange={
                                    handleCustomerChange
                                }
                                required
                            />

                        </div>

                        <div className="form-group">

                            <label>
                                Email
                            </label>

                            <input
                                type="email"
                                name="email"
                                placeholder="Enter email address"
                                value={
                                    customerForm.email
                                }
                                onChange={
                                    handleCustomerChange
                                }
                                required
                            />

                        </div>

                        <div className="form-group">

                            <label>
                                Phone
                            </label>

                            <input
                                name="phone"
                                placeholder="Enter phone number"
                                value={
                                    customerForm.phone
                                }
                                onChange={
                                    handleCustomerChange
                                }
                            />

                        </div>

                        <div className="form-group full-width">

                            <label>
                                Address
                            </label>

                            <input
                                name="address"
                                placeholder="Enter address"
                                value={
                                    customerForm.address
                                }
                                onChange={
                                    handleCustomerChange
                                }
                            />

                        </div>

                        <div className="form-group">

                            <label>
                                City
                            </label>

                            <input
                                name="city"
                                placeholder="Enter city"
                                value={
                                    customerForm.city
                                }
                                onChange={
                                    handleCustomerChange
                                }
                            />

                        </div>

                        <div className="form-group">

                            <label>
                                State
                            </label>

                            <input
                                name="state"
                                placeholder="Enter state"
                                value={
                                    customerForm.state
                                }
                                onChange={
                                    handleCustomerChange
                                }
                            />

                        </div>

                        <div className="form-group">

                            <label>
                                ZIP Code
                            </label>

                            <input
                                name="zipCode"
                                placeholder="Enter ZIP code"
                                value={
                                    customerForm.zipCode
                                }
                                onChange={
                                    handleCustomerChange
                                }
                            />

                        </div>

                    </div>

                    <div className="form-actions">

                        <button
                            type="submit"
                            className="add-customer-btn"
                        >
                            + Add Customer
                        </button>

                    </div>

                </form>

            </div>

            {/* CUSTOMER LIST */}

            <div className="customer-list-section">

                <div className="list-header">

                    <div>

                        <h2>
                            Customers
                        </h2>

                        <p>
                            View customers and
                            their associated sites
                        </p>

                    </div>

                    <div className="customer-count">

                        {customers.length}
                        {" "}
                        Customers

                    </div>

                </div>

                {loading ? (

                    <div className="loading">
                        Loading customers...
                    </div>

                ) : customers.length === 0 ? (

                    <div className="empty-state">

                        <h3>
                            No Customers Found
                        </h3>

                        <p>
                            Add your first customer
                            using the form above.
                        </p>

                    </div>

                ) : (

                    <div className="customer-grid">

                        {customers.map(
                            (customer) => (

                                <div
                                    className="customer-item"
                                    key={customer.id}
                                >

                                    <div className="customer-main">

                                        <div className="customer-icon">

                                            {customer.companyName
                                                ? customer.companyName
                                                    .charAt(0)
                                                    .toUpperCase()
                                                : "C"}

                                        </div>

                                        <div className="customer-info">

                                            <h3>
                                                {
                                                    customer.companyName
                                                }
                                            </h3>

                                            <p>
                                                <strong>
                                                    Contact:
                                                </strong>{" "}
                                                {
                                                    customer.contactPerson
                                                }
                                            </p>

                                            <p>
                                                <strong>
                                                    Email:
                                                </strong>{" "}
                                                {
                                                    customer.email
                                                }
                                            </p>

                                            <p>
                                                <strong>
                                                    Phone:
                                                </strong>{" "}
                                                {
                                                    customer.phone
                                                    || "N/A"
                                                }
                                            </p>

                                            <p>
                                                <strong>
                                                    Location:
                                                </strong>{" "}
                                                {
                                                    customer.city
                                                    || "N/A"
                                                }

                                                {customer.state
                                                    ? `, ${customer.state}`
                                                    : ""}
                                            </p>

                                        </div>

                                    </div>

                                    <div className="site-actions">

                                        <button
                                            className="view-sites-btn"
                                            onClick={() =>
                                                toggleSites(
                                                    customer.id
                                                )
                                            }
                                        >
                                            {expandedCustomer ===
                                            customer.id
                                                ? "▲ Hide Sites"
                                                : "▼ View Sites"}
                                        </button>

                                        <button
                                            className="add-site-btn"
                                            onClick={() => {

                                                setShowSiteForm(
                                                    customer.id
                                                );

                                                setExpandedCustomer(
                                                    customer.id
                                                );

                                                loadSites(
                                                    customer.id
                                                );
                                            }}
                                        >
                                            + Add Site
                                        </button>

                                    </div>

                                    {expandedCustomer ===
                                        customer.id && (

                                        <div className="sites-section">

                                            <div className="sites-header">

                                                <div>

                                                    <h3>
                                                        Sites
                                                    </h3>

                                                    <p>
                                                        Sites associated
                                                        with{" "}
                                                        {
                                                            customer.companyName
                                                        }
                                                    </p>

                                                </div>

                                                <span className="site-badge">

                                                    {
                                                        (
                                                            sites[
                                                                customer.id
                                                            ] || []
                                                        ).length
                                                    }{" "}
                                                    Sites

                                                </span>

                                            </div>

                                            {showSiteForm ===
                                                customer.id && (

                                                <form
                                                    className="site-form"
                                                    onSubmit={(event) =>
                                                        handleSiteSubmit(
                                                            event,
                                                            customer.id
                                                        )
                                                    }
                                                >

                                                    <h4>
                                                        Add New Site
                                                    </h4>

                                                    <div className="site-form-grid">

                                                        <div className="form-group">

                                                            <label>
                                                                Site Name
                                                            </label>

                                                            <input
                                                                name="siteName"
                                                                placeholder="Enter site name"
                                                                value={
                                                                    siteForm.siteName
                                                                }
                                                                onChange={
                                                                    handleSiteChange
                                                                }
                                                                required
                                                            />

                                                        </div>

                                                        <div className="form-group">

                                                            <label>
                                                                Contact Person
                                                            </label>

                                                            <input
                                                                name="contactPerson"
                                                                placeholder="Enter contact person"
                                                                value={
                                                                    siteForm.contactPerson
                                                                }
                                                                onChange={
                                                                    handleSiteChange
                                                                }
                                                            />

                                                        </div>

                                                        <div className="form-group">

                                                            <label>
                                                                Contact Phone
                                                            </label>

                                                            <input
                                                                name="contactPhone"
                                                                placeholder="Enter phone number"
                                                                value={
                                                                    siteForm.contactPhone
                                                                }
                                                                onChange={
                                                                    handleSiteChange
                                                                }
                                                            />

                                                        </div>

                                                        <div className="form-group">

                                                            <label>
                                                                Address
                                                            </label>

                                                            <input
                                                                name="address"
                                                                placeholder="Enter site address"
                                                                value={
                                                                    siteForm.address
                                                                }
                                                                onChange={
                                                                    handleSiteChange
                                                                }
                                                            />

                                                        </div>

                                                        <div className="form-group">

                                                            <label>
                                                                City
                                                            </label>

                                                            <input
                                                                name="city"
                                                                placeholder="Enter city"
                                                                value={
                                                                    siteForm.city
                                                                }
                                                                onChange={
                                                                    handleSiteChange
                                                                }
                                                            />

                                                        </div>

                                                        <div className="form-group">

                                                            <label>
                                                                State
                                                            </label>

                                                            <input
                                                                name="state"
                                                                placeholder="Enter state"
                                                                value={
                                                                    siteForm.state
                                                                }
                                                                onChange={
                                                                    handleSiteChange
                                                                }
                                                            />

                                                        </div>

                                                        <div className="form-group">

                                                            <label>
                                                                ZIP Code
                                                            </label>

                                                            <input
                                                                name="zipCode"
                                                                placeholder="Enter ZIP code"
                                                                value={
                                                                    siteForm.zipCode
                                                                }
                                                                onChange={
                                                                    handleSiteChange
                                                                }
                                                            />

                                                        </div>

                                                    </div>

                                                    <div className="site-form-actions">

                                                        <button
                                                            type="submit"
                                                            className="save-site-btn"
                                                        >
                                                            Save Site
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="cancel-site-btn"
                                                            onClick={() =>
                                                                setShowSiteForm(
                                                                    null
                                                                )
                                                            }
                                                        >
                                                            Cancel
                                                        </button>

                                                    </div>

                                                </form>
                                            )}

                                            {sites[
                                                customer.id
                                            ] === undefined ? (

                                                <div className="site-loading">
                                                    Loading sites...
                                                </div>

                                            ) : (
                                                sites[
                                                    customer.id
                                                ].length === 0 ? (

                                                    <div className="no-sites">

                                                        <div>
                                                            🏢
                                                        </div>

                                                        <h4>
                                                            No Sites Found
                                                        </h4>

                                                        <p>
                                                            Add a site
                                                            for this
                                                            customer.
                                                        </p>

                                                    </div>

                                                ) : (

                                                    <div className="site-grid">

                                                        {sites[
                                                            customer.id
                                                        ].map(
                                                            (site) => (

                                                                <div
                                                                    className="site-card"
                                                                    key={
                                                                        site.id
                                                                    }
                                                                >

                                                                    <div className="site-card-icon">
                                                                        🏢
                                                                    </div>

                                                                    <div className="site-card-info">

                                                                        <h4>
                                                                            {
                                                                                site.siteName
                                                                            }
                                                                        </h4>

                                                                        <p>
                                                                            <strong>
                                                                                Contact:
                                                                            </strong>{" "}
                                                                            {
                                                                                site.contactPerson
                                                                                || "N/A"
                                                                            }
                                                                        </p>

                                                                        <p>
                                                                            <strong>
                                                                                Phone:
                                                                            </strong>{" "}
                                                                            {
                                                                                site.contactPhone
                                                                                || "N/A"
                                                                            }
                                                                        </p>

                                                                        <p>
                                                                            <strong>
                                                                                Address:
                                                                            </strong>{" "}
                                                                            {
                                                                                site.address
                                                                                || "N/A"
                                                                            }
                                                                        </p>

                                                                        <p>
                                                                            <strong>
                                                                                Location:
                                                                            </strong>{" "}
                                                                            {
                                                                                site.city
                                                                                || "N/A"
                                                                            }

                                                                            {site.state
                                                                                ? `, ${site.state}`
                                                                                : ""}
                                                                        </p>

                                                                        <span className="site-id">
                                                                            Site ID:{" "}
                                                                            {
                                                                                site.id
                                                                            }
                                                                        </span>

                                                                    </div>

                                                                </div>
                                                            )
                                                        )}

                                                    </div>
                                                )
                                            )}

                                        </div>
                                    )}

                                </div>
                            )
                        )}

                    </div>
                )}

            </div>

        </div>
    );
}

export default Customers;