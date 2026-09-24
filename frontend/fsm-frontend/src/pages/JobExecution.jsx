
import {
    useEffect,
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import {
    User,
    Play,
    CheckCircle2,
    Wrench,
    FileText,
    Image as ImageIcon,
    Upload,
    Eye
} from "lucide-react";

import {
    getSchedulesByTechnician,
    getJobExecutionsByTechnician,
    getWorkOrdersByTechnician,
    getTechnicianByUserId,
    getJobPhotosByExecution,
    getInventoryParts,
    getPartUsageByJobExecution,
    recordPartUsage,
    startJob,
    completeJob,
    cancelJobExecution,
    uploadJobPhoto
} from "../services/api";

import "./JobExecution.css";


function JobExecution() {

    const navigate =
        useNavigate();


    // =====================================================
    // STATE
    // =====================================================

    const [schedules, setSchedules] =
        useState([]);

    const [jobExecutions, setJobExecutions] =
        useState([]);

    const [workOrders, setWorkOrders] =
        useState([]);

    const [inventoryParts, setInventoryParts] =
        useState([]);

    const [jobPhotos, setJobPhotos] =
        useState({});

    const [partUsages, setPartUsages] =
        useState({});

    const [selectedParts, setSelectedParts] =
        useState({});

    const [partQuantities, setPartQuantities] =
        useState({});

    const [recordingPartId, setRecordingPartId] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [startingJob, setStartingJob] =
        useState(false);

    const [uploadingPhotoId, setUploadingPhotoId] =
        useState(null);

    const [selectedPhoto, setSelectedPhoto] =
        useState(null);


    // =====================================================
    // LOAD DATA
    // =====================================================

    useEffect(() => {

        loadData();

    }, []);


    async function loadData() {

        try {

            setLoading(true);

            setError("");


            const storedUser =
                localStorage.getItem(
                    "fieldsyncUser"
                );


            if (!storedUser) {

                logoutAndRedirect();

                return;

            }


            const user =
                JSON.parse(
                    storedUser
                );


            const role =
                String(
                    user.role || ""
                ).toUpperCase();


            if (role !== "TECHNICIAN") {

                navigate(
                    "/dashboard"
                );

                return;

            }


            if (!user.id) {

                throw new Error(
                    "Logged-in user ID is missing."
                );

            }


            const technician =
                await getTechnicianByUserId(
                    user.id
                );


            const technicianId =
                technician?.id;


            if (!technicianId) {

                throw new Error(
                    "Technician profile ID is missing."
                );

            }


            console.log(
                "👨‍🔧 TECHNICIAN ID:",
                technicianId
            );


            // =================================================
            // LOAD MAIN DATA
            // =================================================

            const [
                scheduleData,
                executionData,
                workOrderData,
                inventoryData
            ] =
                await Promise.all([

                    getSchedulesByTechnician(
                        technicianId
                    ),

                    getJobExecutionsByTechnician(
                        technicianId
                    ),

                    getWorkOrdersByTechnician(
                        technicianId
                    ),

                    getInventoryParts()

                ]);


            const scheduleList =
                Array.isArray(
                    scheduleData
                )
                    ? scheduleData
                    : [];


            const executionList =
                Array.isArray(
                    executionData
                )
                    ? executionData
                    : [];


            const workOrderList =
                Array.isArray(
                    workOrderData
                )
                    ? workOrderData
                    : [];


            const inventoryList =
                Array.isArray(
                    inventoryData
                )
                    ? inventoryData
                    : [];


            setSchedules(
                scheduleList
            );


            setJobExecutions(
                executionList
            );


            setWorkOrders(
                workOrderList
            );


            setInventoryParts(
                inventoryList
            );


            // =================================================
            // LOAD PHOTOS BY EXECUTION
            // =================================================

            const executionIds =
                executionList
                    .map(
                        execution =>
                            execution.id
                    )
                    .filter(Boolean);


            if (
                executionIds.length > 0
            ) {

                const photoResults =
                    await Promise.all(
                        executionIds.map(
                            async (
                                executionId
                            ) => {

                                try {

                                    const photos =
                                        await getJobPhotosByExecution(
                                            executionId
                                        );


                                    return {
                                        executionId,

                                        photos:
                                            Array.isArray(
                                                photos
                                            )
                                                ? photos
                                                : []
                                    };

                                } catch (
                                    photoError
                                ) {

                                    console.error(
                                        `Failed to load photos for execution ${executionId}:`,
                                        photoError
                                    );


                                    return {
                                        executionId,

                                        photos: []
                                    };

                                }

                            }
                        )
                    );


                const photoMap = {};


                photoResults.forEach(
                    result => {

                        photoMap[
                            result.executionId
                        ] =
                            result.photos;

                    }
                );


                setJobPhotos(
                    photoMap
                );


                // =================================================
                // LOAD PART USAGE BY EXECUTION
                // =================================================

                const partUsageResults =
                    await Promise.all(
                        executionIds.map(
                            async (
                                executionId
                            ) => {

                                try {

                                    const usages =
                                        await getPartUsageByJobExecution(
                                            executionId
                                        );


                                    return {
                                        executionId,

                                        usages:
                                            Array.isArray(
                                                usages
                                            )
                                                ? usages
                                                : []
                                    };

                                } catch (
                                    usageError
                                ) {

                                    console.error(
                                        `Failed to load part usage for execution ${executionId}:`,
                                        usageError
                                    );


                                    return {
                                        executionId,

                                        usages: []
                                    };

                                }

                            }
                        )
                    );


                const usageMap = {};


                partUsageResults.forEach(
                    result => {

                        usageMap[
                            result.executionId
                        ] =
                            result.usages;

                    }
                );


                setPartUsages(
                    usageMap
                );

            } else {

                setJobPhotos({});

                setPartUsages({});

            }

        } catch (err) {

            console.error(
                "Job execution loading error:",
                err
            );


            if (
                err.message?.includes(
                    "HTTP 401"
                )
            ) {

                logoutAndRedirect();

                return;

            }


            setError(
                err.message ||
                "Unable to load your service jobs."
            );

        } finally {

            setLoading(false);

        }

    }


    // =====================================================
    // LOGOUT
    // =====================================================

    function logoutAndRedirect() {

        localStorage.removeItem(
            "fieldsyncToken"
        );


        localStorage.removeItem(
            "fieldsyncAuthenticated"
        );


        localStorage.removeItem(
            "fieldsyncUser"
        );


        navigate(
            "/login"
        );

    }


    // =====================================================
    // GET TECHNICIAN ID
    // =====================================================

    async function getCurrentTechnicianId() {

        const storedUser =
            localStorage.getItem(
                "fieldsyncUser"
            );


        if (!storedUser) {

            logoutAndRedirect();

            throw new Error(
                "Logged-in user not found."
            );

        }


        const user =
            JSON.parse(
                storedUser
            );


        if (!user?.id) {

            throw new Error(
                "Logged-in user ID is missing."
            );

        }


        const technician =
            await getTechnicianByUserId(
                user.id
            );


        const technicianId =
            technician?.id;


        if (!technicianId) {

            throw new Error(
                "Technician ID is missing."
            );

        }


        return technicianId;

    }


    // =====================================================
    // FIND WORK ORDER
    // =====================================================

    function getWorkOrderForSchedule(
        schedule
    ) {

        if (!schedule) {

            return null;

        }


        const workOrderId =
            schedule.workOrderId;


        if (!workOrderId) {

            return null;

        }


        return workOrders.find(
            workOrder =>
                Number(
                    workOrder.id
                ) ===
                Number(
                    workOrderId
                )
        );

    }


    // =====================================================
    // FIND INVENTORY PART
    // =====================================================

    function getInventoryPart(
        partId
    ) {

        return inventoryParts.find(
            part =>
                Number(
                    part.id
                ) ===
                Number(
                    partId
                )
        );

    }


    // =====================================================
    // START JOB
    // =====================================================

    async function handleStartJob(
        schedule
    ) {

        if (startingJob) {

            return;

        }


        try {

            setStartingJob(
                true
            );


            const technicianId =
                await getCurrentTechnicianId();


            const workOrder =
                getWorkOrderForSchedule(
                    schedule
                );


            if (!workOrder) {

                throw new Error(
                    "No work order was found for this schedule."
                );

            }


            const requestData = {

                scheduleId:
                    schedule.id,

                workOrderId:
                    workOrder.id,

                technicianId:
                    technicianId,

                status:
                    "IN_PROGRESS"

            };


            console.log(
                "STARTING JOB:",
                requestData
            );


            await startJob(
                requestData
            );


            alert(
                "Job started successfully! 🚀"
            );


            await loadData();

        } catch (err) {

            console.error(
                "Error starting job:",
                err
            );


            if (
                err.message?.includes(
                    "HTTP 401"
                )
            ) {

                logoutAndRedirect();

                return;

            }


            alert(
                `Unable to start job.\n\n${err.message}`
            );

        } finally {

            setStartingJob(
                false
            );

        }

    }


    // =====================================================
    // RECORD PART USAGE
    // =====================================================

    async function handleRecordPart(
        execution
    ) {

        if (
            !execution?.id
        ) {

            return;

        }


        const selectedPartId =
            selectedParts[
                execution.id
            ];


        const quantity =
            Number(
                partQuantities[
                    execution.id
                ]
            );


        if (!selectedPartId) {

            alert(
                "Please select an inventory part."
            );

            return;

        }


        if (
            !quantity ||
            quantity <= 0
        ) {

            alert(
                "Please enter a valid quantity."
            );

            return;

        }


        const part =
            getInventoryPart(
                selectedPartId
            );


        if (!part) {

            alert(
                "Selected inventory part was not found."
            );

            return;

        }


        if (
            quantity >
            Number(
                part.quantity || 0
            )
        ) {

            alert(
                `Insufficient stock.\n\nAvailable quantity: ${part.quantity}`
            );

            return;

        }


        if (
            !execution.workOrderId
        ) {

            alert(
                "Work order information is missing for this execution."
            );

            return;

        }


        try {

            setRecordingPartId(
                execution.id
            );


            const technicianId =
                await getCurrentTechnicianId();


            const usageData = {

                workOrderId:
                    execution.workOrderId,

                jobExecutionId:
                    execution.id,

                technicianId:
                    technicianId,

                inventoryPartId:
                    Number(
                        selectedPartId
                    ),

                quantityUsed:
                    quantity

            };


            console.log(
                "RECORDING PART USAGE:",
                usageData
            );


            const savedUsage =
                await recordPartUsage(
                    usageData
                );


            console.log(
                "✅ PART USAGE SAVED:",
                savedUsage
            );


            setPartUsages(
                previous => ({

                    ...previous,

                    [execution.id]:
                        [
                            ...(previous[
                                execution.id
                            ] || []),

                            savedUsage

                        ]

                })
            );


            // =================================================
            // UPDATE LOCAL INVENTORY STOCK
            // =================================================

            setInventoryParts(
                previous =>
                    previous.map(
                        item =>
                            Number(
                                item.id
                            ) ===
                            Number(
                                selectedPartId
                            )
                                ? {
                                    ...item,

                                    quantity:
                                        Number(
                                            item.quantity || 0
                                        ) -
                                        quantity

                                }
                                : item
                    )
            );


            // =================================================
            // RESET FORM
            // =================================================

            setSelectedParts(
                previous => ({

                    ...previous,

                    [execution.id]:
                        ""

                })
            );


            setPartQuantities(
                previous => ({

                    ...previous,

                    [execution.id]:
                        ""

                })
            );


            alert(
                "Part usage recorded successfully! 🔧"
            );

        } catch (err) {

            console.error(
                "Error recording part usage:",
                err
            );


            if (
                err.message?.includes(
                    "HTTP 401"
                )
            ) {

                logoutAndRedirect();

                return;

            }


            alert(
                `Unable to record part usage.\n\n${err.message}`
            );

        } finally {

            setRecordingPartId(
                null
            );

        }

    }


    // =====================================================
    // DELETE / NOT USED FROM UI YET
    // =====================================================

    function getPartsForExecution(
        execution
    ) {

        return (
            partUsages[
                execution.id
            ] || []
        );

    }


    // =====================================================
    // COMPLETE JOB
    // =====================================================

    async function handleCompleteJob(
        execution
    ) {

        try {

            const completionNotes =
                window.prompt(
                    "Enter completion notes:",
                    execution.completionNotes ||
                    ""
                );


            if (
                completionNotes === null
            ) {

                return;

            }


            await completeJob(
                execution.id,
                {
                    completionNotes:
                        completionNotes,

                    status:
                        "COMPLETED"
                }
            );


            alert(
                "Job completed successfully! 🎉"
            );


            await loadData();

        } catch (err) {

            console.error(
                "Error completing job:",
                err
            );


            if (
                err.message?.includes(
                    "HTTP 401"
                )
            ) {

                logoutAndRedirect();

                return;

            }


            alert(
                `Unable to complete job.\n\n${err.message}`
            );

        }

    }


    // =====================================================
    // CANCEL JOB
    // =====================================================

    async function handleCancelJob(
        execution
    ) {

        const confirmed =
            window.confirm(
                "Are you sure you want to cancel this job?"
            );


        if (!confirmed) {

            return;

        }


        try {

            await cancelJobExecution(
                execution.id
            );


            alert(
                "Job cancelled successfully."
            );


            await loadData();

        } catch (err) {

            console.error(
                "Error cancelling job:",
                err
            );


            if (
                err.message?.includes(
                    "HTTP 401"
                )
            ) {

                logoutAndRedirect();

                return;

            }


            alert(
                `Unable to cancel job.\n\n${err.message}`
            );

        }

    }


    // =====================================================
    // PHOTO UPLOAD
    // =====================================================

    async function handlePhotoUpload(
        execution,
        event
    ) {

        const file =
            event.target.files?.[0];


        if (!file) {

            return;

        }


        if (
            !file.type.startsWith(
                "image/"
            )
        ) {

            alert(
                "Please select an image file."
            );


            event.target.value = "";

            return;

        }


        if (
            file.size >
            10 * 1024 * 1024
        ) {

            alert(
                "Image size must be 10 MB or less."
            );


            event.target.value = "";

            return;

        }


        try {

            setUploadingPhotoId(
                execution.id
            );


            const result =
                await uploadJobPhoto(
                    file,
                    execution.id
                );


            console.log(
                "✅ PHOTO UPLOADED:",
                result
            );


            if (
                result &&
                result.id
            ) {

                setJobPhotos(
                    previous => ({

                        ...previous,

                        [execution.id]:
                            [
                                ...(previous[
                                    execution.id
                                ] || []),

                                result
                            ]

                    })
                );

            } else {

                const photos =
                    await getJobPhotosByExecution(
                        execution.id
                    );


                setJobPhotos(
                    previous => ({

                        ...previous,

                        [execution.id]:
                            Array.isArray(
                                photos
                            )
                                ? photos
                                : []

                    })
                );

            }


            alert(
                "Photo uploaded successfully! 📸"
            );

        } catch (err) {

            console.error(
                "Error uploading photo:",
                err
            );


            if (
                err.message?.includes(
                    "HTTP 401"
                )
            ) {

                logoutAndRedirect();

                return;

            }


            alert(
                `Unable to upload photo.\n\n${err.message}`
            );

        } finally {

            setUploadingPhotoId(
                null
            );


            event.target.value = "";

        }

    }


    // =====================================================
    // STATUS
    // =====================================================

    function getStatusClass(
        status
    ) {

        const normalized =
            String(
                status || ""
            )
                .toUpperCase();


        switch (
            normalized
        ) {

            case "COMPLETED":
                return "completed";

            case "IN_PROGRESS":
                return "in-progress";

            case "CANCELLED":
                return "cancelled";

            case "NOT_STARTED":
                return "not-started";

            default:
                return "not-started";

        }

    }


    function getStatusIcon(
        status
    ) {

        const normalized =
            String(
                status || ""
            )
                .toUpperCase();


        switch (
            normalized
        ) {

            case "COMPLETED":
                return "✓";

            case "CANCELLED":
                return "×";

            case "IN_PROGRESS":
                return "●";

            default:
                return "○";

        }

    }


    // =====================================================
    // FORMAT DATE
    // =====================================================

    function formatDate(
        date
    ) {

        if (!date) {

            return "-";

        }


        const parsed =
            new Date(
                date
            );


        if (
            Number.isNaN(
                parsed.getTime()
            )
        ) {

            return "-";

        }


        return parsed.toLocaleString(
            "en-IN",
            {
                day:
                    "2-digit",

                month:
                    "short",

                year:
                    "numeric",

                hour:
                    "2-digit",

                minute:
                    "2-digit"
            }
        );

    }


    // =====================================================
    // GET PHOTOS FOR EXECUTION
    // =====================================================

    function getPhotosForExecution(
        execution
    ) {

        return (
            jobPhotos[
                execution.id
            ] || []
        );

    }


    // =====================================================
    // COUNTS
    // =====================================================

    const activeJobs =
        jobExecutions.filter(
            execution =>
                String(
                    execution.status || ""
                ).toUpperCase() ===
                "IN_PROGRESS"
        ).length;


    const completedJobs =
        jobExecutions.filter(
            execution =>
                String(
                    execution.status || ""
                ).toUpperCase() ===
                "COMPLETED"
        ).length;


    const totalPhotos =
        Object.values(
            jobPhotos
        ).reduce(
            (
                total,
                photos
            ) =>
                total +
                photos.length,
            0
        );


    const totalPartsUsed =
        Object.values(
            partUsages
        ).reduce(
            (
                total,
                usages
            ) =>
                total +
                usages.reduce(
                    (
                        sum,
                        usage
                    ) =>
                        sum +
                        Number(
                            usage.quantityUsed || 0
                        ),
                    0
                ),
            0
        );


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div className="je-page">

                <div className="je-loading">

                    <div className="je-loading-orbit">

                        <div></div>

                    </div>


                    <h2>
                        Preparing Service Execution
                    </h2>


                    <p>
                        Loading your field operations...
                    </p>

                </div>

            </div>

        );

    }


    // =====================================================
    // UI
    // =====================================================

    return (

        <div className="je-page">


            <div className="je-art je-art-one"></div>
            <div className="je-art je-art-two"></div>
            <div className="je-art je-art-three"></div>


            {/* =================================================
                HEADER
            ================================================= */}

            <header className="je-header">

                <div className="je-heading">

                    <div className="je-eyebrow-row">

                        <span className="je-eyebrow">
                            FIELDSYNC / FIELD OPERATIONS
                        </span>


                        <span className="je-live-dot">

                            <i></i>

                            LIVE

                        </span>

                    </div>


                    <h1>
                        Service Execution
                    </h1>


                    <p>
                        Execute assigned jobs, capture field
                        evidence and close service work.
                    </p>

                </div>


                <div className="je-summary">

                    <div className="je-summary-card">

                        <span className="je-summary-icon active-icon">
                            ●
                        </span>


                        <div>

                            <strong>
                                {activeJobs}
                            </strong>


                            <span>
                                ACTIVE
                            </span>

                        </div>

                    </div>


                    <div className="je-summary-card">

                        <span className="je-summary-icon complete-icon">
                            ✓
                        </span>


                        <div>

                            <strong>
                                {completedJobs}
                            </strong>


                            <span>
                                COMPLETED
                            </span>

                        </div>

                    </div>


                    <div className="je-summary-card">

                        <span className="je-summary-icon photo-icon">
                            ▣
                        </span>


                        <div>

                            <strong>
                                {totalPhotos}
                            </strong>


                            <span>
                                PHOTOS
                            </span>

                        </div>

                    </div>


                    <div className="je-summary-card">

                        <span className="je-summary-icon">
                            ⚙
                        </span>


                        <div>

                            <strong>
                                {totalPartsUsed}
                            </strong>


                            <span>
                                PARTS USED
                            </span>

                        </div>

                    </div>

                </div>

            </header>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="je-error">

                    <div className="je-error-symbol">
                        !
                    </div>


                    <div className="je-error-content">

                        <strong>
                            Unable to load service data
                        </strong>


                        <span>
                            {error}
                        </span>

                    </div>


                    <button
                        onClick={
                            loadData
                        }
                    >
                        Retry
                    </button>

                </div>

            )}


            {/* =================================================
                SCHEDULED JOBS
            ================================================= */}

            <section className="je-section">

                <div className="je-section-header">

                    <div>

                        <span className="je-section-label">
                            TODAY'S WORK QUEUE
                        </span>


                        <h2>
                            Scheduled Jobs
                        </h2>


                        <p>
                            Start the next assigned field job
                            directly from your queue.
                        </p>

                    </div>


                    <div className="je-queue-count">

                        <span>
                            {schedules.length}
                        </span>

                        <small>
                            ASSIGNED
                        </small>

                    </div>

                </div>


                {schedules.length === 0 ? (

                    <div className="je-empty">

                        <div className="je-empty-art">

                            <span></span>
                            <span></span>
                            <span></span>

                        </div>


                        <h3>
                            Your queue is clear
                        </h3>


                        <p>
                            There are no scheduled service
                            jobs assigned to you right now.
                        </p>

                    </div>

                ) : (

                    <div className="je-schedule-grid">

                        {schedules.map(
                            (
                                schedule,
                                index
                            ) => {

                                const workOrder =
                                    getWorkOrderForSchedule(
                                        schedule
                                    );


                                const priority =
                                    String(
                                        workOrder?.priority ||
                                        schedule.priority ||
                                        "MEDIUM"
                                    ).toLowerCase();


                                return (

                                    <article
                                        className="je-schedule-card"
                                        key={
                                            schedule.id
                                        }
                                    >

                                        <div className="je-card-topline">

                                            <span className="je-job-index">

                                                {String(
                                                    index + 1
                                                ).padStart(
                                                    2,
                                                    "0"
                                                )}

                                            </span>


                                            <span
                                                className={`je-priority ${priority}`}
                                            >

                                                <i></i>

                                                {priority}

                                            </span>

                                        </div>


                                        <div className="je-work-order">

                                            {
                                                workOrder?.orderNumber ||
                                                `WORK ORDER #${schedule.workOrderId || "-"}`
                                            }

                                        </div>


                                        <h3 className="je-schedule-title">

                                            {
                                                schedule.title ||
                                                schedule.description ||
                                                workOrder?.title ||
                                                workOrder?.description ||
                                                "Scheduled Service"
                                            }

                                        </h3>


                                        <div className="je-job-meta">

                                            <div>

                                                <span className="je-meta-icon">
                                                    ◷
                                                </span>

                                                <span>
                                                    {
                                                        formatDate(
                                                            schedule.scheduledDate
                                                        )
                                                    }
                                                </span>

                                            </div>


                                            <div>

                                                <span className="je-meta-icon">
                                                    ◇
                                                </span>

                                                <span>
                                                    {
                                                        schedule.location ||
                                                        schedule.serviceLocation ||
                                                        workOrder?.serviceLocation ||
                                                        "Service Location"
                                                    }
                                                </span>

                                            </div>

                                        </div>


                                        <div className="je-card-bottom">

                                            <span className="je-assigned-label">
                                                ASSIGNED TO YOU
                                            </span>


                                            <button
                                                className="je-start-btn"
                                                onClick={() =>
                                                    handleStartJob(
                                                        schedule
                                                    )
                                                }
                                                disabled={
                                                    startingJob ||
                                                    !workOrder
                                                }
                                            >

                                                <span>
                                                    →
                                                </span>


                                                {startingJob
                                                    ? "Starting..."
                                                    : workOrder
                                                        ? "Start Job"
                                                        : "Missing Work Order"}

                                            </button>

                                        </div>

                                    </article>

                                );

                            }
                        )}

                    </div>

                )}

            </section>


            {/* =================================================
                EXECUTION HISTORY
            ================================================= */}

            <section className="je-section">

                <div className="je-section-header">

                    <div>

                        <span className="je-section-label">
                            EXECUTION CENTER
                        </span>


                        <h2>
                            Active & Completed Jobs
                        </h2>


                        <p>
                            Manage active work and review your
                            completed field service history.
                        </p>

                    </div>


                    <div className="je-execution-mark">

                        <span></span>

                        FIELD LOG

                    </div>

                </div>


                {jobExecutions.length === 0 ? (

                    <div className="je-empty">

                        <div className="je-empty-art execution-art">

                            <span></span>
                            <span></span>
                            <span></span>

                        </div>


                        <h3>
                            No execution history
                        </h3>


                        <p>
                            Start a scheduled job to create
                            your first execution record.
                        </p>

                    </div>

                ) : (

                    <div className="je-execution-list">

                        {jobExecutions.map(
                            execution => {

                                const status =
                                    String(
                                        execution.status ||
                                        "UNKNOWN"
                                    ).toUpperCase();


                                const statusClass =
                                    getStatusClass(
                                        execution.status
                                    );


                                const cardClass =
                                    status === "IN_PROGRESS"
                                        ? "active"
                                        : status === "COMPLETED"
                                            ? "completed"
                                            : status === "CANCELLED"
                                                ? "cancelled-card"
                                                : "";


                                const photos =
                                    getPhotosForExecution(
                                        execution
                                    );


                                const executionParts =
                                    getPartsForExecution(
                                        execution
                                    );


                                const selectedPartId =
                                    selectedParts[
                                        execution.id
                                    ] || "";


                                const selectedPart =
                                    getInventoryPart(
                                        selectedPartId
                                    );


                                const selectedQuantity =
                                    Number(
                                        partQuantities[
                                            execution.id
                                        ] || 0
                                    );


                                return (

                                    <article
                                        className={`je-execution-card ${cardClass}`}
                                        key={
                                            execution.id
                                        }
                                    >

                                        <div className="je-execution-top">

                                            <div className="je-execution-title">

                                                <div
                                                    className={`je-execution-icon ${statusClass}`}
                                                >

                                                    {
                                                        getStatusIcon(
                                                            status
                                                        )
                                                    }

                                                </div>


                                                <div>

                                                    <div className="je-execution-kicker">
                                                        EXECUTION RECORD
                                                    </div>


                                                    <h3>
                                                        Job Execution #{execution.id}
                                                    </h3>


                                                    <p>
                                                        Work Order #{execution.workOrderId || "-"}
                                                    </p>

                                                </div>

                                            </div>


                                            <span
                                                className={`je-status ${statusClass}`}
                                            >

                                                <i></i>

                                                {status.replace(
                                                    /_/g,
                                                    " "
                                                )}

                                            </span>

                                        </div>


                                        <div className="je-execution-details">

                                            <div className="je-detail-item">
                                                <div className="je-detail-icon"><User /></div>
                                                <div className="je-detail-copy">
                                                    <span>TECHNICIAN</span>
                                                    <strong>You</strong>
                                                </div>
                                            </div>


                                            <div className="je-detail-item">
                                                <div className="je-detail-icon"><Play /></div>
                                                <div className="je-detail-copy">
                                                    <span>STARTED</span>
                                                    <strong>{formatDate(execution.startedAt)}</strong>
                                                </div>
                                            </div>


                                            <div className="je-detail-item">
                                                <div className="je-detail-icon"><CheckCircle2 /></div>
                                                <div className="je-detail-copy">
                                                    <span>COMPLETED</span>
                                                    <strong>{formatDate(execution.completedAt)}</strong>
                                                </div>
                                            </div>

                                        </div>


                                        {execution.workNotes && (

                                            <div className="je-notes">

                                                <div className="je-note-symbol">
                                                    /
                                                </div>


                                                <div>

                                                    <strong>
                                                        Work Notes
                                                    </strong>


                                                    <span>
                                                        {
                                                            execution.workNotes
                                                        }
                                                    </span>

                                                </div>

                                            </div>

                                        )}


                                        {/* =================================================
                                            PARTS USED
                                        ================================================= */}

                                        <div className="je-parts-section">

                                            <div className="je-parts-header">

                                                <div>

                                                    <div className="je-parts-title">

                                                        <Wrench className="je-section-icon" />


                                                        <strong>
                                                            Parts Used
                                                        </strong>


                                                        <span className="je-parts-count">
                                                            {
                                                                executionParts.length
                                                            }
                                                        </span>

                                                    </div>


                                                    <p>
                                                        Record spare parts consumed during this job.
                                                    </p>

                                                </div>

                                            </div>


                                            {/* =============================================
                                                RECORD PART FORM
                                            ============================================= */}

                                            {status === "IN_PROGRESS" && (

                                                <div className="je-parts-form">

                                                    <div className="je-parts-field">

                                                        <label>
                                                            INVENTORY PART
                                                        </label>


                                                        <select
                                                            value={
                                                                selectedPartId
                                                            }
                                                            onChange={
                                                                event =>
                                                                    setSelectedParts(
                                                                        previous => ({

                                                                            ...previous,

                                                                            [execution.id]:
                                                                                event.target.value

                                                                        })
                                                                    )
                                                            }
                                                            disabled={
                                                                recordingPartId ===
                                                                execution.id
                                                            }
                                                        >

                                                            <option value="">
                                                                Select Part
                                                            </option>


                                                            {inventoryParts.map(
                                                                part => (

                                                                    <option
                                                                        key={
                                                                            part.id
                                                                        }
                                                                        value={
                                                                            part.id
                                                                        }
                                                                        disabled={
                                                                            Number(
                                                                                part.quantity || 0
                                                                            ) <=
                                                                            0
                                                                        }
                                                                    >

                                                                        {
                                                                            part.partName
                                                                        }
                                                                        {" — "}
                                                                        {
                                                                            part.partNumber
                                                                        }
                                                                        {" — Stock: "}
                                                                        {
                                                                            part.quantity
                                                                        }

                                                                    </option>

                                                                )
                                                            )}

                                                        </select>

                                                    </div>


                                                    <div className="je-parts-field">

                                                        <label>
                                                            QUANTITY
                                                        </label>


                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max={
                                                                selectedPart?.quantity ||
                                                                1
                                                            }
                                                            value={
                                                                partQuantities[
                                                                    execution.id
                                                                ] || ""
                                                            }
                                                            onChange={
                                                                event =>
                                                                    setPartQuantities(
                                                                        previous => ({

                                                                            ...previous,

                                                                            [execution.id]:
                                                                                event.target.value

                                                                        })
                                                                    )
                                                            }
                                                            placeholder="Qty"
                                                            disabled={
                                                                recordingPartId ===
                                                                execution.id
                                                            }
                                                        />

                                                    </div>


                                                    <div className="je-parts-stock">

                                                        <span>
                                                            AVAILABLE
                                                        </span>


                                                        <strong>
                                                            {
                                                                selectedPart
                                                                    ? selectedPart.quantity
                                                                    : "-"
                                                            }
                                                        </strong>

                                                    </div>


                                                    <div className="je-parts-cost">

                                                        <span>
                                                            EST. COST
                                                        </span>


                                                        <strong>
                                                            ₹
                                                            {
                                                                selectedPart &&
                                                                selectedQuantity
                                                                    ? (
                                                                        Number(
                                                                            selectedPart.unitPrice || 0
                                                                        ) *
                                                                        selectedQuantity
                                                                    ).toFixed(
                                                                        2
                                                                    )
                                                                    : "0.00"
                                                            }
                                                        </strong>

                                                    </div>


                                                    <button
                                                        type="button"
                                                        className="je-record-part-btn"
                                                        onClick={() =>
                                                            handleRecordPart(
                                                                execution
                                                            )
                                                        }
                                                        disabled={
                                                            recordingPartId ===
                                                            execution.id ||
                                                            !selectedPartId ||
                                                            !selectedQuantity ||
                                                            selectedQuantity <= 0 ||
                                                            (
                                                                selectedPart &&
                                                                selectedQuantity >
                                                                Number(
                                                                    selectedPart.quantity || 0
                                                                )
                                                            )
                                                        }
                                                    >

                                                        {
                                                            recordingPartId ===
                                                            execution.id
                                                                ? "Recording..."
                                                                : "Record Part"
                                                        }

                                                    </button>

                                                </div>

                                            )}


                                            {/* =============================================
                                                USED PARTS LIST
                                            ============================================= */}

                                            {executionParts.length === 0 ? (

                                                <div className="je-no-parts">

                                                    <div className="je-empty-section-icon">
                                                        <Wrench />
                                                    </div>


                                                    <span>
                                                        No parts recorded for this job yet.
                                                    </span>

                                                </div>

                                            ) : (

                                                <div className="je-parts-list">

                                                    {executionParts.map(
                                                        usage => {

                                                            const part =
                                                                getInventoryPart(
                                                                    usage.inventoryPartId
                                                                );


                                                            return (

                                                                <div
                                                                    className="je-part-row"
                                                                    key={
                                                                        usage.id
                                                                    }
                                                                >

                                                                    <div className="je-part-main">

                                                                        <strong>
                                                                            {
                                                                                part?.partName ||
                                                                                `Part #${usage.inventoryPartId}`
                                                                            }
                                                                        </strong>


                                                                        <span>
                                                                            {
                                                                                part?.partNumber ||
                                                                                "Inventory Part"
                                                                            }
                                                                        </span>

                                                                    </div>


                                                                    <div className="je-part-qty">

                                                                        <span>
                                                                            QTY
                                                                        </span>


                                                                        <strong>
                                                                            {
                                                                                usage.quantityUsed
                                                                            }
                                                                        </strong>

                                                                    </div>


                                                                    <div className="je-part-price">

                                                                        <span>
                                                                            UNIT PRICE
                                                                        </span>


                                                                        <strong>
                                                                            ₹
                                                                            {
                                                                                Number(
                                                                                    usage.unitPrice || 0
                                                                                ).toFixed(
                                                                                    2
                                                                                )
                                                                            }
                                                                        </strong>

                                                                    </div>


                                                                    <div className="je-part-total">

                                                                        <span>
                                                                            TOTAL
                                                                        </span>


                                                                        <strong>
                                                                            ₹
                                                                            {
                                                                                Number(
                                                                                    usage.totalCost || 0
                                                                                ).toFixed(
                                                                                    2
                                                                                )
                                                                            }
                                                                        </strong>

                                                                    </div>

                                                                </div>

                                                            );

                                                        }
                                                    )}

                                                </div>

                                            )}

                                        </div>


                                        {execution.partsUsed && (

                                            <div className="je-notes">

                                                <div className="je-note-symbol">
                                                    <Wrench />
                                                </div>


                                                <div>

                                                    <strong>
                                                        Parts Notes
                                                    </strong>


                                                    <span>
                                                        {
                                                            execution.partsUsed
                                                        }
                                                    </span>

                                                </div>

                                            </div>

                                        )}


                                        {execution.completionNotes && (

                                            <div className="je-notes je-completion-notes">

                                                <div className="je-note-symbol">
                                                    <FileText />
                                                </div>


                                                <div>

                                                    <strong>
                                                        Completion Notes
                                                    </strong>


                                                    <span>
                                                        {
                                                            execution.completionNotes
                                                        }
                                                    </span>

                                                </div>

                                            </div>

                                        )}


                                        {/* =================================================
                                            PHOTOS
                                        ================================================= */}

                                        <div className="je-photo-section">

                                            <div className="je-photo-header">

                                                <div>

                                                    <div className="je-photo-title">

                                                        <span className="je-photo-icon">
                                                            <ImageIcon />
                                                        </span>


                                                        <strong>
                                                            Job Photos
                                                        </strong>


                                                        <span className="je-photo-count">
                                                            {
                                                                photos.length
                                                            }
                                                        </span>

                                                    </div>


                                                    <p>
                                                        Photos for this specific job execution
                                                    </p>

                                                </div>


                                                <label className="je-upload-btn">

                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={
                                                            event =>
                                                                handlePhotoUpload(
                                                                    execution,
                                                                    event
                                                                )
                                                        }
                                                        disabled={
                                                            uploadingPhotoId ===
                                                            execution.id
                                                        }
                                                    />


                                                    <Upload className="je-upload-icon" />
                                                    <span>
                                                        {
                                                            uploadingPhotoId ===
                                                            execution.id
                                                                ? "Uploading..."
                                                                : "Add Photo"
                                                        }
                                                    </span>

                                                </label>

                                            </div>


                                            {photos.length === 0 ? (

                                                <div className="je-no-photos">

                                                    <div className="je-no-photo-icon">
                                                        <ImageIcon />
                                                    </div>


                                                    <div>

                                                        <strong>
                                                            No photos for this job
                                                        </strong>


                                                        <span>
                                                            Upload equipment,
                                                            site or completed-work photos.
                                                        </span>

                                                    </div>

                                                </div>

                                            ) : (

                                                <div className="je-photo-grid">

                                                    {photos.map(
                                                        photo => (

                                                            <button
                                                                type="button"
                                                                className="je-photo-card"
                                                                key={
                                                                    photo.id
                                                                }
                                                                onClick={() =>
                                                                    setSelectedPhoto(
                                                                        photo
                                                                    )
                                                                }
                                                            >

                                                                <img
                                                                    src={
                                                                        photo.imageUrl
                                                                    }
                                                                    alt={
                                                                        `Job photo ${photo.id}`
                                                                    }
                                                                />


                                                                <span className="je-photo-overlay">
                                                                    <span>
                                                                        <Eye />
                                                                        View
                                                                    </span>
                                                                </span>

                                                            </button>

                                                        )
                                                    )}


                                                    <label className="je-photo-add-card">

                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={
                                                                event =>
                                                                    handlePhotoUpload(
                                                                        execution,
                                                                        event
                                                                    )
                                                            }
                                                            disabled={
                                                                uploadingPhotoId ===
                                                                execution.id
                                                            }
                                                        />


                                                        <Upload className="je-photo-add-plus" />

                                                        <strong>
                                                            Add Photo
                                                        </strong>


                                                        <small>
                                                            JPG / PNG / WEBP
                                                        </small>

                                                    </label>

                                                </div>

                                            )}

                                        </div>


                                        {/* =================================================
                                            ACTIONS
                                        ================================================= */}

                                        {status === "IN_PROGRESS" && (

                                            <div className="je-actions">

                                                <button
                                                    className="je-cancel-btn"
                                                    onClick={() =>
                                                        handleCancelJob(
                                                            execution
                                                        )
                                                    }
                                                    disabled={
                                                        uploadingPhotoId ===
                                                        execution.id ||
                                                        recordingPartId ===
                                                        execution.id
                                                    }
                                                >

                                                    Cancel Job

                                                </button>


                                                <button
                                                    className="je-complete-btn"
                                                    onClick={() =>
                                                        handleCompleteJob(
                                                            execution
                                                        )
                                                    }
                                                    disabled={
                                                        uploadingPhotoId ===
                                                        execution.id ||
                                                        recordingPartId ===
                                                        execution.id
                                                    }
                                                >

                                                    <span>
                                                        ✓
                                                    </span>


                                                    Complete Job

                                                </button>

                                            </div>

                                        )}

                                    </article>

                                );

                            }
                        )}

                    </div>

                )}

            </section>


            {/* =================================================
                PHOTO LIGHTBOX
            ================================================= */}

            {selectedPhoto && (

                <div
                    className="je-lightbox"
                    onClick={() =>
                        setSelectedPhoto(
                            null
                        )
                    }
                >

                    <button
                        type="button"
                        className="je-lightbox-close"
                        onClick={() =>
                            setSelectedPhoto(
                                null
                            )
                        }
                    >
                        ×
                    </button>


                    <div
                        className="je-lightbox-content"
                        onClick={
                            event =>
                                event.stopPropagation()
                        }
                    >

                        <img
                            src={
                                selectedPhoto.imageUrl
                            }
                            alt="Job evidence"
                        />


                        <div className="je-lightbox-caption">

                            <strong>
                                Job Photo
                            </strong>


                            <span>
                                Uploaded{" "}
                                {
                                    formatDate(
                                        selectedPhoto.uploadedAt
                                    )
                                }
                            </span>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

}


export default JobExecution;

