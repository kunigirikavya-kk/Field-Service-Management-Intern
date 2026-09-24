import { useEffect, useState } from "react";
import { Star, Wrench } from "lucide-react";
import {
    createTechnician,
    getTechnicians
} from "../services/api";
import "./Technicians.css";

function Technicians() {

    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        employeeCode: "",
        fullName: "",
        email: "",
        accountPassword: "",
        phone: "",
        specialization: "",
        status: "AVAILABLE",
        rating: 0
    });

    const loadTechnicians = async () => {
        try {
            const data = await getTechnicians();

            setTechnicians(
                Array.isArray(data) ? data : []
            );

        } catch (error) {
            console.error(
                "Failed to load technicians:",
                error
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTechnicians();
    }, []);

    const handleChange = (event) => {

        const { name, value } = event.target;

        setForm({
            ...form,
            [name]: value
        });
    };

    const handleSubmit = async (event) => {

        event.preventDefault();

        setSaving(true);

        try {

            await createTechnician({
                ...form,
                email: form.email.trim().toLowerCase(),
                accountPassword: form.accountPassword,
                rating: Number(form.rating)
            });

            setForm({
                employeeCode: "",
                fullName: "",
                email: "",
                accountPassword: "",
                phone: "",
                specialization: "",
                status: "AVAILABLE",
                rating: 0
            });

            await loadTechnicians();

            alert("Technician created successfully!");

        } catch (error) {

            console.error(
                "Failed to create technician:",
                error
            );

            alert(
                error?.message || "Failed to create technician."
            );

        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="technician-page">

            <div className="technician-header">

                <div>
                    <div className="inventory-inspired-title-row">
                        <div className="inventory-inspired-icon"><Wrench size={25} strokeWidth={1.8} aria-hidden /></div>
                        <div>
                            <span className="inventory-inspired-eyebrow">TECHNICIANS • FIELDSYNC</span>
                            <h1>Technician Management</h1>

                            <p>
                                Manage technicians and their
                                professional information
                            </p>
                        </div>
                    </div>
                </div>

                <div className="technician-count">
                    {technicians.length} Technicians
                </div>

            </div>


            <div className="technician-card">

                <div className="card-title">

                    <h2>Add New Technician</h2>

                    <p>
                        Enter the technician details below. The email must belong to an existing TECHNICIAN user account.
                    </p>

                </div>


                <form onSubmit={handleSubmit}>

                    <div className="form-grid">

                        <div className="form-group">

                            <label>
                                Employee Code
                            </label>

                            <input
                                name="employeeCode"
                                placeholder="Example: TECH001"
                                value={form.employeeCode}
                                onChange={handleChange}
                                required
                            />

                        </div>


                        <div className="form-group">

                            <label>
                                Full Name
                            </label>

                            <input
                                name="fullName"
                                placeholder="Enter technician name"
                                value={form.fullName}
                                onChange={handleChange}
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
                                placeholder="Enter email"
                                value={form.email}
                                onChange={handleChange}
                                required
                            />

                        </div>


                        <div className="form-group">

                            <label>
                                Account Password
                            </label>

                            <input
                                type="password"
                                name="accountPassword"
                                placeholder="Minimum 6 characters for a new account"
                                value={form.accountPassword}
                                onChange={handleChange}
                                minLength="6"
                            />

                        </div>


                        <div className="form-group">

                            <label>
                                Phone
                            </label>

                            <input
                                name="phone"
                                placeholder="Enter phone number"
                                value={form.phone}
                                onChange={handleChange}
                            />

                        </div>


                        <div className="form-group">

                            <label>
                                Specialization
                            </label>

                            <input
                                name="specialization"
                                placeholder="Example: Electrical"
                                value={form.specialization}
                                onChange={handleChange}
                            />

                        </div>


                        <div className="form-group">

                            <label>
                                Status
                            </label>

                            <select
                                name="status"
                                value={form.status}
                                onChange={handleChange}
                            >

                                <option value="AVAILABLE">
                                    Available
                                </option>

                                <option value="BUSY">
                                    Busy
                                </option>

                                <option value="OFFLINE">
                                    Offline
                                </option>

                            </select>

                        </div>


                        <div className="form-group">

                            <label>
                                Rating
                            </label>

                            <input
                                type="number"
                                name="rating"
                                min="0"
                                max="5"
                                step="0.1"
                                value={form.rating}
                                onChange={handleChange}
                            />

                        </div>

                    </div>


                    <div className="form-actions">

                        <button
                            type="submit"
                            className="add-technician-btn"
                            disabled={saving}
                        >

                            {saving
                                ? "Creating..."
                                : "+ Add Technician"}

                        </button>

                    </div>

                </form>

            </div>


            <div className="technician-list-section">

                <div className="list-header">

                    <div>

                        <h2>Technicians</h2>

                        <p>
                            View all registered technicians
                        </p>

                    </div>

                </div>


                {loading ? (

                    <div className="loading">
                        Loading technicians...
                    </div>

                ) : technicians.length === 0 ? (

                    <div className="empty-state">

                        <h3>
                            No Technicians Found
                        </h3>

                        <p>
                            Add your first technician
                            using the form above.
                        </p>

                    </div>

                ) : (

                    <div className="technician-grid">

                        {technicians.map((technician) => (

                            <div
                                className="technician-item"
                                key={technician.id}
                            >

                                <div className="technician-icon">

                                    {(
                                        technician.fullName ||
                                        technician.name ||
                                        "T"
                                    )
                                        .charAt(0)
                                        .toUpperCase()}

                                </div>


                                <div className="technician-info">

                                    <div className="technician-top">

                                        <div className="technician-identity">

                                            <h3>

                                                {technician.fullName ||
                                                    technician.name ||
                                                    "Unnamed Technician"}

                                            </h3>

                                            <span className="employee-code">

                                                {technician.employeeCode ||
                                                    "N/A"}

                                            </span>

                                        </div>


                                        <span
                                            className={
                                                `status-badge status-${(
                                                    technician.status ||
                                                    "AVAILABLE"
                                                ).toLowerCase()}`
                                            }
                                        >

                                            {technician.status ||
                                                "AVAILABLE"}

                                        </span>

                                    </div>


                                    <div className="technician-details-grid">
                                        <div className="technician-detail">
                                            <strong>Email</strong>
                                            <span>{technician.email || "N/A"}</span>
                                        </div>
                                        <div className="technician-detail">
                                            <strong>Phone</strong>
                                            <span>{technician.phone || "N/A"}</span>
                                        </div>
                                        <div className="technician-detail">
                                            <strong>Specialization</strong>
                                            <span>{technician.specialization || "N/A"}</span>
                                        </div>
                                        <div className="technician-detail">
                                            <strong>Rating</strong>
                                            <span className="technician-rating">
                                                <Star size={15} strokeWidth={1.8} fill="currentColor" aria-hidden />
                                                {technician.rating ?? "0.00"}
                                            </span>
                                        </div>
                                    </div>

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </div>

        </div>
    );
}

export default Technicians;