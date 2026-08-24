import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { createSite, getSites } from "../services/api";

function Sites() {

    const { customerId } = useParams();

    const [sites, setSites] = useState([]);
    const [loading, setLoading] = useState(true);

    const [form, setForm] = useState({
        name: "",
        address: "",
        city: "",
        state: "",
        zipCode: ""
    });

    const loadSites = async () => {
        try {
            const data = await getSites(customerId);

            console.log("SITES FROM BACKEND:", data);

            if (Array.isArray(data)) {
                setSites(data);
            } else if (data) {
                setSites([data]);
            } else {
                setSites([]);
            }

        } catch (error) {
            console.error("Failed to load sites:", error);
            setSites([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSites();
    }, [customerId]);

    const handleChange = (event) => {
        setForm({
            ...form,
            [event.target.name]: event.target.value
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        console.log("SITE FORM DATA:", form);
        console.log("CUSTOMER ID:", customerId);

        if (
            !form.name.trim() ||
            !form.address.trim() ||
            !form.city.trim() ||
            !form.state.trim() ||
            !form.zipCode.trim()
        ) {
            alert("Please fill all site fields.");
            return;
        }

        try {

            const result = await createSite(
                customerId,
                form
            );

            console.log("SITE CREATED:", result);

            setForm({
                name: "",
                address: "",
                city: "",
                state: "",
                zipCode: ""
            });

            await loadSites();

            alert("Site created successfully!");

        } catch (error) {

            console.error("SITE CREATE ERROR:", error);

            alert(
                "Failed to create site.\n\n" +
                (error.message || "Unknown error")
            );
        }
    };

    return (
        <div
            style={{
                padding: "40px",
                maxWidth: "1200px",
                margin: "0 auto"
            }}
        >

            <h1 style={{ fontSize: "38px" }}>
                Site Management
            </h1>

            <p style={{ color: "#64748b" }}>
                Manage customer service locations.
            </p>


            {/* ADD SITE */}

            <div
                style={{
                    background: "#ffffff",
                    padding: "30px",
                    borderRadius: "16px",
                    marginTop: "30px",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.06)"
                }}
            >

                <h2>Add New Site</h2>

                <form
                    onSubmit={handleSubmit}
                    autoComplete="off"
                >

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "20px"
                        }}
                    >

                        <input
                            name="name"
                            type="text"
                            placeholder="Site Name"
                            value={form.name}
                            onChange={handleChange}
                            autoComplete="off"
                            required
                        />

                        <input
                            name="address"
                            type="text"
                            placeholder="Address"
                            value={form.address}
                            onChange={handleChange}
                            autoComplete="off"
                            required
                        />

                        <input
                            name="city"
                            type="text"
                            placeholder="City"
                            value={form.city}
                            onChange={handleChange}
                            autoComplete="off"
                            required
                        />

                        <input
                            name="state"
                            type="text"
                            placeholder="State"
                            value={form.state}
                            onChange={handleChange}
                            autoComplete="off"
                            required
                        />

                        <input
                            name="zipCode"
                            type="text"
                            placeholder="ZIP Code"
                            value={form.zipCode}
                            onChange={handleChange}
                            autoComplete="off"
                            required
                        />

                    </div>

                    <button
                        type="submit"
                        style={{
                            marginTop: "25px",
                            padding: "13px 25px",
                            border: "none",
                            borderRadius: "8px",
                            background: "#4f46e5",
                            color: "white",
                            fontSize: "16px",
                            fontWeight: "600",
                            cursor: "pointer"
                        }}
                    >
                        + Add Site
                    </button>

                </form>

            </div>


            {/* SITES */}

            <div
                style={{
                    background: "#ffffff",
                    padding: "30px",
                    borderRadius: "16px",
                    marginTop: "30px",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.06)"
                }}
            >

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}
                >

                    <div>

                        <h2>Customer Sites</h2>

                        <p style={{ color: "#64748b" }}>
                            Service locations for customer #{customerId}
                        </p>

                    </div>

                    <span
                        style={{
                            background: "#eef2ff",
                            color: "#4f46e5",
                            padding: "10px 18px",
                            borderRadius: "20px",
                            fontWeight: "600"
                        }}
                    >
                        {sites.length} Sites
                    </span>

                </div>


                {loading ? (

                    <p>Loading sites...</p>

                ) : sites.length === 0 ? (

                    <p
                        style={{
                            color: "#64748b",
                            marginTop: "25px"
                        }}
                    >
                        No sites found for this customer.
                    </p>

                ) : (

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(2, 1fr)",
                            gap: "20px",
                            marginTop: "25px"
                        }}
                    >

                        {sites.map((site) => (

                            <div
                                key={site.id}
                                style={{
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "12px",
                                    padding: "20px"
                                }}
                            >

                                <h3>
                                    {site.name}
                                </h3>

                                <p>
                                    <strong>Address:</strong>{" "}
                                    {site.address}
                                </p>

                                <p>
                                    <strong>City:</strong>{" "}
                                    {site.city}
                                </p>

                                <p>
                                    <strong>State:</strong>{" "}
                                    {site.state}
                                </p>

                                <p>
                                    <strong>ZIP:</strong>{" "}
                                    {site.zipCode}
                                </p>

                            </div>

                        ))}

                    </div>

                )}

            </div>

        </div>
    );
}

export default Sites;