import { useNavigate } from "react-router-dom";
import "./ServiceRequest.css";

function ServiceRequest() {

    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();

        // Later we will connect this to Spring Boot API
        alert("Service request created successfully!");

        navigate("/work-orders");
    };

    return (
        <div className="service-request-page">

            <div className="page-heading">
                <div>
                    <h1>New Service Request</h1>
                    <p>Create a new service request for a customer.</p>
                </div>
            </div>

            <div className="service-request-card">

                <form onSubmit={handleSubmit}>

                    <div className="form-grid">

                        <div className="form-group">
                            <label>Customer</label>

                            <select required>
                                <option value="">Select Customer</option>
                                <option>ABC Industries</option>
                                <option>XYZ Technologies</option>
                                <option>Global Systems</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Service Type</label>

                            <select required>
                                <option value="">Select Service Type</option>
                                <option>AC Maintenance</option>
                                <option>Equipment Repair</option>
                                <option>System Inspection</option>
                                <option>Installation</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Priority</label>

                            <select required>
                                <option value="">Select Priority</option>
                                <option>Low</option>
                                <option>Medium</option>
                                <option>High</option>
                                <option>Critical</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Preferred Date</label>

                            <input
                                type="date"
                                required
                            />
                        </div>

                        <div className="form-group full-width">
                            <label>Service Location</label>

                            <input
                                type="text"
                                placeholder="Enter service location"
                                required
                            />
                        </div>

                        <div className="form-group full-width">
                            <label>Problem Description</label>

                            <textarea
                                rows="5"
                                placeholder="Describe the service requirement..."
                                required
                            ></textarea>
                        </div>

                    </div>

                    <div className="form-actions">

                        <button
                            type="button"
                            className="cancel-button"
                            onClick={() => navigate("/dashboard")}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="primary-button"
                        >
                            Create Service Request
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}

export default ServiceRequest;