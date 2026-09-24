import { useEffect, useState } from "react";

import {
    getWorkOrders,
    getWorkOrdersByTechnician,
    getWorkOrdersByCustomer,
    createWorkOrder,
    updateWorkOrder,
    getServiceRequests,
    getTechnicians,
    getTechnicianByUserId,
    getCurrentCustomer,
    getSites,
    createSite,
    assignTechnician,
    getInventoryParts,
    getPartUsageByWorkOrder
} from "../services/api";

import "./WorkOrders.css";


function WorkOrders() {

    // =====================================================
    // LOGGED-IN USER
    // =====================================================

    let currentUser = null;

    try {

        const storedUser =
            localStorage.getItem("fieldsyncUser");

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


    const userRole =
        String(
            currentUser?.role || ""
        ).toUpperCase();


    const userId =
        currentUser?.id;


    const isTechnician =
        userRole === "TECHNICIAN";


    const isCustomer =
        userRole === "CUSTOMER";


    const canManageWorkOrders =
        userRole === "DISPATCHER" ||
        userRole === "MANAGER";


    // =====================================================
    // STATE
    // =====================================================

    const [workOrders, setWorkOrders] =
        useState([]);

    const [serviceRequests, setServiceRequests] =
        useState([]);

    const [technicians, setTechnicians] =
        useState([]);

    const [sites, setSites] =
        useState([]);

    const [siteNames, setSiteNames] =
        useState({});

    const [inventoryParts, setInventoryParts] =
        useState([]);

    const [partUsages, setPartUsages] =
        useState({});

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [editingWorkOrder, setEditingWorkOrder] = useState(null);

    const [editForm, setEditForm] = useState({
        title: "",
        serviceType: "",
        priority: "MEDIUM",
        description: "",
        scheduledDate: "",
        completedDate: "",
        totalCost: ""
    });

    const [updatingWorkOrder, setUpdatingWorkOrder] = useState(false);

    const [savingSite, setSavingSite] =
        useState(false);

    const [assigningId, setAssigningId] =
        useState(null);

    const [selectedTechnicians, setSelectedTechnicians] =
        useState({});

    const [showNewSiteForm, setShowNewSiteForm] =
        useState(false);


    // =====================================================
    // FORM
    // =====================================================

    const [form, setForm] = useState({

        serviceRequestId: "",
        technicianId: "",
        customerId: "",
        siteId: "",
        title: "",
        serviceType: "",
        priority: "MEDIUM",
        description: "",
        status: "NEW",
        scheduledDate: "",
        completedDate: "",
        totalCost: "",
        serviceLocation: ""

    });


    // =====================================================
    // NEW SITE FORM
    // =====================================================

    const [newSite, setNewSite] = useState({

        siteName: "",
        contactPerson: "",
        contactPhone: "",
        address: "",
        city: "",
        state: "",
        zipCode: ""

    });


    // =====================================================
    // LOAD WORK ORDERS
    // =====================================================

    const loadWorkOrders = async () => {

        try {

            setLoading(true);

            let data;


            // ---------------------------------------------
            // TECHNICIAN
            // ---------------------------------------------

            if (isTechnician) {

                if (!userId) {

                    throw new Error(
                        "Logged-in technician user ID not found."
                    );

                }


                console.log(
                    "🔥 WORK ORDERS - LOGGED-IN USER ID:",
                    userId
                );


                const technician =
                    await getTechnicianByUserId(
                        userId
                    );


                console.log(
                    "👨‍🔧 LOGGED-IN TECHNICIAN:",
                    technician
                );


                const technicianId =
                    technician?.id;


                if (!technicianId) {

                    throw new Error(
                        "Technician record not found."
                    );

                }


                console.log(
                    "👨‍🔧 TECHNICIAN ID:",
                    technicianId
                );


                console.log(
                    "🔥 FINAL TECHNICIAN ID BEFORE WORK ORDER API:",
                    technicianId
                );


                console.log(
                    "🔥 CALLING WORK ORDERS API WITH TECHNICIAN ID:",
                    technicianId
                );


                data =
                    await getWorkOrdersByTechnician(
                        technicianId
                    );

            }


            // ---------------------------------------------
            // CUSTOMER
            // ---------------------------------------------

            else if (isCustomer) {

                if (!userId) {

                    throw new Error(
                        "Logged-in customer user ID not found."
                    );

                }


                /*
                 * IMPORTANT:
                 *
                 * fieldsyncUser.id is the USER ID.
                 *
                 * Work orders use CUSTOMER ID.
                 *
                 * Therefore fetch /customers/me first.
                 */

                const customer =
                    await getCurrentCustomer();


                if (!customer?.id) {

                    throw new Error(
                        "Customer profile not found."
                    );

                }


                console.log(
                    "👤 LOGGED-IN CUSTOMER:",
                    customer
                );


                data =
                    await getWorkOrdersByCustomer(
                        customer.id
                    );

            }


            // ---------------------------------------------
            // DISPATCHER / MANAGER
            // ---------------------------------------------

            else {

                data =
                    await getWorkOrders();

            }


            // =================================================
            // NORMALIZE WORK ORDER RESPONSE
            // =================================================

            const workOrderList =
                Array.isArray(data)
                    ? data
                    : Array.isArray(data?.content)
                        ? data.content
                        : Array.isArray(data?.data)
                            ? data.data
                            : [];


            console.log(
                "📋 Work Orders:",
                workOrderList
            );


            setWorkOrders(
                workOrderList
            );


            // =================================================
            // LOAD SITE NAMES
            // =================================================

            const customerIds =
                [
                    ...new Set(
                        workOrderList
                            .map(
                                order =>
                                    order.customerId
                            )
                            .filter(
                                id =>
                                    id !== null &&
                                    id !== undefined
                            )
                    )
                ];


            const siteMap = {};


            await Promise.all(
                customerIds.map(
                    async customerId => {

                        try {

                            const siteData =
                                await getSites(
                                    customerId
                                );


                            const siteList =
                                Array.isArray(siteData)
                                    ? siteData
                                    : Array.isArray(siteData?.content)
                                        ? siteData.content
                                        : Array.isArray(siteData?.data)
                                            ? siteData.data
                                            : [];


                            siteList.forEach(
                                site => {

                                    if (site?.id) {

                                        siteMap[
                                            site.id
                                        ] =
                                            site.siteName ||
                                            site.name ||
                                            site.address ||
                                            `Site ${site.id}`;

                                    }

                                }
                            );

                        } catch (siteError) {

                            console.error(
                                `Failed to load sites for customer ${customerId}:`,
                                siteError
                            );

                        }

                    }
                )
            );


            setSiteNames(
                siteMap
            );


            // =================================================
            // LOAD INVENTORY PARTS
            // =================================================

            const canViewInventory =
                isTechnician ||
                canManageWorkOrders;


            if (!canViewInventory) {

                console.log(
                    "🔒 Inventory loading skipped for CUSTOMER."
                );


                setInventoryParts([]);

            } else {

                try {

                    const inventoryData =
                        await getInventoryParts();


                    const inventoryList =
                        Array.isArray(inventoryData)
                            ? inventoryData
                            : Array.isArray(inventoryData?.content)
                                ? inventoryData.content
                                : Array.isArray(inventoryData?.data)
                                    ? inventoryData.data
                                    : [];


                    console.log(
                        "🔧 Inventory Parts:",
                        inventoryList
                    );


                    setInventoryParts(
                        inventoryList
                    );

                } catch (inventoryError) {

                    console.error(
                        "Failed to load inventory parts:",
                        inventoryError
                    );


                    setInventoryParts([]);

                }

            }


            // =================================================
            // LOAD PART USAGE BY WORK ORDER
            // =================================================

            const usageResults =
                await Promise.all(
                    workOrderList.map(
                        async order => {

                            try {

                                const usages =
                                    await getPartUsageByWorkOrder(
                                        order.id
                                    );


                                return {

                                    workOrderId:
                                        order.id,

                                    usages:
                                        Array.isArray(usages)
                                            ? usages
                                            : []

                                };

                            } catch (usageError) {

                                console.error(
                                    `Failed to load part usage for work order ${order.id}:`,
                                    usageError
                                );


                                return {

                                    workOrderId:
                                        order.id,

                                    usages: []

                                };

                            }

                        }
                    )
                );


            const usageMap = {};


            usageResults.forEach(
                result => {

                    usageMap[
                        result.workOrderId
                    ] =
                        result.usages;

                }
            );


            console.log(
                "🔧 Part Usage:",
                usageMap
            );


            setPartUsages(
                usageMap
            );


            // =================================================
            // INITIALIZE TECHNICIAN DROPDOWN
            // =================================================

            const technicianSelections = {};


            workOrderList.forEach(
                order => {

                    const assignedTechnicianId =
                        order.technicianId ??
                        order.technician?.id ??
                        order.technician?.technicianId ??
                        "";


                    if (assignedTechnicianId) {

                        technicianSelections[
                            order.id
                        ] =
                            String(
                                assignedTechnicianId
                            );

                    }

                }
            );


            console.log(
                "👨‍🔧 Current Technician Selections:",
                technicianSelections
            );


            setSelectedTechnicians(
                technicianSelections
            );


        } catch (error) {

            console.error(
                "Failed to load work orders:",
                error
            );


            alert(
                "Failed to load work orders.\n\n" +
                error.message
            );

        } finally {

            setLoading(false);

        }

    };


    // =====================================================
    // LOAD SERVICE REQUESTS
    // =====================================================

    const loadServiceRequests = async () => {

        if (
            isTechnician ||
            isCustomer
        ) {

            setServiceRequests([]);

            return;

        }


        try {

            const data =
                await getServiceRequests();


            console.log(
                "Service Requests:",
                data
            );


            setServiceRequests(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (error) {

            console.error(
                "Failed to load service requests:",
                error
            );


            setServiceRequests([]);

        }

    };


    // =====================================================
    // LOAD TECHNICIANS
    // =====================================================

    const loadTechnicians = async () => {

        if (
            isTechnician ||
            isCustomer
        ) {

            setTechnicians([]);

            return;

        }


        try {

            const data =
                await getTechnicians();


            console.log(
                "Technicians:",
                data
            );


            setTechnicians(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (error) {

            console.error(
                "Failed to load technicians:",
                error
            );


            setTechnicians([]);

        }

    };


    // =====================================================
    // LOAD SITES
    // =====================================================

    const loadSites = async (
        customerId
    ) => {

        if (!customerId) {

            setSites([]);

            return [];

        }


        try {

            console.log(
                "🏢 Loading sites for Customer:",
                customerId
            );


            const data =
                await getSites(
                    customerId
                );


            console.log(
                "🏢 Sites returned from API:",
                data
            );


            const siteList =
                Array.isArray(data)
                    ? data
                    : Array.isArray(data?.content)
                        ? data.content
                        : Array.isArray(data?.data)
                            ? data.data
                            : [];


            const customerSites =
                siteList.filter(
                    site => {

                        const siteCustomerId =
                            site.customerId ??
                            site.customer?.id ??
                            site.customer?.userId;


                        return (
                            String(
                                siteCustomerId
                            ) ===
                            String(
                                customerId
                            )
                        );

                    }
                );


            console.log(
                "🏢 Customer Sites:",
                customerSites
            );


            setSites(
                customerSites
            );


            const siteMap = {};


            customerSites.forEach(
                site => {

                    siteMap[
                        site.id
                    ] =
                        site.siteName ||
                        site.name ||
                        site.address ||
                        `Site ${site.id}`;

                }
            );


            setSiteNames(
                previous => ({
                    ...previous,
                    ...siteMap
                })
            );


            return customerSites;

        } catch (error) {

            console.error(
                "Failed to load sites for customer:",
                customerId,
                error
            );


            setSites([]);

            return [];

        }

    };


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        loadWorkOrders();
        loadServiceRequests();
        loadTechnicians();

    }, []);


    // =====================================================
    // HANDLE SERVICE REQUEST
    // =====================================================

    const handleServiceRequestChange =
        async (
            event
        ) => {

            const serviceRequestId =
                event.target.value;


            if (!serviceRequestId) {

                resetForm();

                return;

            }


            const selectedRequest =
                serviceRequests.find(
                    request =>
                        String(
                            request.id
                        ) ===
                        String(
                            serviceRequestId
                        )
                );


            if (!selectedRequest) {

                return;

            }


            console.log(
                "📋 Selected Service Request:",
                selectedRequest
            );


            const customerId =
                selectedRequest.customerId ??
                selectedRequest.customer?.id ??
                "";


            let scheduledDate = "";


            if (
                selectedRequest.preferredDate
            ) {

                scheduledDate =
                    `${selectedRequest.preferredDate}T09:00`;

            }


            setForm({

                serviceRequestId:
                    selectedRequest.id,

                technicianId:
                    "",

                customerId:
                    customerId,

                siteId:
                    "",

                title:
                    selectedRequest.title ||
                    selectedRequest.serviceType ||
                    "",

                serviceType:
                    selectedRequest.serviceType ||
                    "",

                priority:
                    selectedRequest.priority ||
                    "MEDIUM",

                description:
                    selectedRequest.description ||
                    "",

                status:
                    "PENDING",

                scheduledDate:
                    scheduledDate,

                completedDate:
                    "",

                totalCost:
                    "",

                serviceLocation:
                    selectedRequest.serviceLocation ||
                    ""

            });


            setShowNewSiteForm(false);


            if (customerId) {

                const customerSites =
                    await loadSites(
                        customerId
                    );


                if (
                    selectedRequest.siteId
                ) {

                    const matchingSite =
                        customerSites.find(
                            site =>
                                String(
                                    site.id
                                ) ===
                                String(
                                    selectedRequest.siteId
                                )
                        );


                    if (matchingSite) {

                        setForm(
                            previous => ({

                                ...previous,

                                siteId:
                                    matchingSite.id

                            })
                        );

                    }

                }

            } else {

                setSites([]);

            }

        };


    // =====================================================
    // HANDLE NORMAL INPUT
    // =====================================================

    const handleChange = (
        event
    ) => {

        const {
            name,
            value
        } = event.target;


        setForm(
            previous => ({

                ...previous,

                [name]:
                    value

            })
        );

    };


    // =====================================================
    // HANDLE SITE SELECT
    // =====================================================

    const handleSiteChange = (
        event
    ) => {

        const value =
            event.target.value;


        if (
            value === "__NEW_SITE__"
        ) {

            setShowNewSiteForm(
                true
            );


            setForm(
                previous => ({

                    ...previous,

                    siteId: ""

                })
            );


            setNewSite({

                siteName: "",
                contactPerson: "",
                contactPhone: "",
                address:
                    form.serviceLocation || "",
                city: "",
                state: "",
                zipCode: ""

            });


            return;

        }


        setShowNewSiteForm(
            false
        );


        setForm(
            previous => ({

                ...previous,

                siteId:
                    value

            })
        );

    };


    // =====================================================
    // HANDLE NEW SITE INPUT
    // =====================================================

    const handleNewSiteChange = (
        event
    ) => {

        const {
            name,
            value
        } = event.target;


        setNewSite(
            previous => ({

                ...previous,

                [name]:
                    value

            })
        );

    };


    // =====================================================
    // CREATE NEW SITE
    // =====================================================

    const handleCreateNewSite = async (
        event
    ) => {

        event.preventDefault();


        if (!form.customerId) {

            alert(
                "Please select a Service Request first."
            );

            return;

        }


        if (
            !newSite.siteName.trim()
        ) {

            alert(
                "Site name is required."
            );

            return;

        }


        setSavingSite(true);


        try {

            const sitePayload = {

                siteName:
                    newSite.siteName.trim(),

                contactPerson:
                    newSite.contactPerson.trim(),

                contactPhone:
                    newSite.contactPhone.trim(),

                address:
                    newSite.address.trim(),

                city:
                    newSite.city.trim(),

                state:
                    newSite.state.trim(),

                zipCode:
                    newSite.zipCode.trim()

            };


            console.log(
                "🏢 Creating New Site:",
                {
                    customerId:
                        form.customerId,
                    site:
                        sitePayload
                }
            );


            const createdSite =
                await createSite(
                    Number(
                        form.customerId
                    ),
                    sitePayload
                );


            console.log(
                "🏢 Created Site:",
                createdSite
            );


            if (!createdSite?.id) {

                throw new Error(
                    "Site was created but no site ID was returned."
                );

            }


            const siteDisplayName =
                createdSite.siteName ||
                createdSite.name ||
                createdSite.address ||
                `Site ${createdSite.id}`;


            setSites(
                previous => [

                    ...previous,
                    createdSite

                ]
            );


            setSiteNames(
                previous => ({

                    ...previous,

                    [createdSite.id]:
                        siteDisplayName

                })
            );


            setForm(
                previous => ({

                    ...previous,

                    siteId:
                        createdSite.id

                })
            );


            setShowNewSiteForm(
                false
            );


            alert(
                "New site created successfully! 🏢"
            );


        } catch (error) {

            console.error(
                "Failed to create new site:",
                error
            );


            alert(
                "Failed to create new site.\n\n" +
                error.message
            );

        } finally {

            setSavingSite(false);

        }

    };


    // =====================================================
    // CANCEL NEW SITE
    // =====================================================

    const handleCancelNewSite = () => {

        setShowNewSiteForm(
            false
        );


        setNewSite({

            siteName: "",
            contactPerson: "",
            contactPhone: "",
            address: "",
            city: "",
            state: "",
            zipCode: ""

        });


        setForm(
            previous => ({

                ...previous,

                siteId: ""

            })
        );

    };


    // =====================================================
    // RESET FORM
    // =====================================================

    const resetForm = () => {

        setForm({

            serviceRequestId: "",
            technicianId: "",
            customerId: "",
            siteId: "",
            title: "",
            priority: "MEDIUM",
            description: "",
            status: "NEW",
            scheduledDate: "",
            completedDate: "",
            totalCost: "",
            serviceLocation: ""

        });


        setSites([]);

        setShowNewSiteForm(
            false
        );


        setNewSite({

            siteName: "",
            contactPerson: "",
            contactPhone: "",
            address: "",
            city: "",
            state: "",
            zipCode: ""

        });

    };


    // =====================================================
    // CREATE WORK ORDER
    // =====================================================

    const handleSubmit = async (
        event
    ) => {

        event.preventDefault();


        if (!canManageWorkOrders) {

            alert(
                "You do not have permission to create work orders."
            );

            return;

        }


        if (!form.serviceRequestId) {

            alert(
                "Please select a Service Request."
            );

            return;

        }


        if (!form.customerId) {

            alert(
                "Customer information is missing."
            );

            return;

        }


        if (!form.siteId) {

            alert(
                "Please select an existing site or create a new site."
            );

            return;

        }


        setSaving(true);


        try {

            const workOrder = {

                serviceRequestId:
                    Number(
                        form.serviceRequestId
                    ),

                technicianId:
                    form.technicianId
                        ? Number(
                            form.technicianId
                        )
                        : null,

                customerId:
                    Number(
                        form.customerId
                    ),

                siteId:
                    Number(
                        form.siteId
                    ),

                title:
                    form.title,

                serviceType:
                    form.serviceType,

                priority:
                    form.priority,

                description:
                    form.description,

                status:
                    form.status,

                scheduledDate:
                    form.scheduledDate
                        ? form.scheduledDate
                        : null,

                completedDate:
                    form.completedDate
                        ? form.completedDate
                        : null,

                totalCost:
                    form.totalCost
                        ? Number(
                            form.totalCost
                        )
                        : 0

            };


            console.log(
                "Creating Work Order:",
                workOrder
            );


            await createWorkOrder(
                workOrder
            );


            alert(
                "Work order created successfully! 🎉"
            );


            resetForm();


            await loadWorkOrders();


        } catch (error) {

            console.error(
                "Failed to create work order:",
                error
            );


            alert(
                "Failed to create work order.\n\n" +
                error.message
            );

        } finally {

            setSaving(false);

        }

    };


    // =====================================================
    // EDIT WORK ORDER
    // =====================================================

    const serviceTypeOptions = [
        "AC Maintenance",
        "Equipment Repair",
        "System Inspection",
        "Installation",
        "Electrical Maintenance",
        "Plumbing Repair",
        "Preventive Maintenance"
    ];

    const normalizeServiceType = (value) => {
        if (!value) return "";
        const normalized = String(value).trim().toLowerCase().replace(/_/g, " ");
        return serviceTypeOptions.find(option => option.toLowerCase() === normalized) || String(value);
    };

    const toDateTimeLocal = (value) => {
        if (!value) return "";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return String(value).slice(0, 16);
        const pad = number => String(number).padStart(2, "0");
        return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate()) + "T" + pad(date.getHours()) + ":" + pad(date.getMinutes());
    };

    const openEditModal = (order) => {
        if (!canManageWorkOrders) return;
        setEditingWorkOrder(order);
        setEditForm({
            title: order.title || "",
            serviceType: normalizeServiceType(order.serviceType),
            priority: order.priority || "MEDIUM",
            description: order.description || "",
            scheduledDate: toDateTimeLocal(order.scheduledDate),
            completedDate: toDateTimeLocal(order.completedDate),
            totalCost: order.totalCost ?? ""
        });
    };

    const closeEditModal = () => {
        if (updatingWorkOrder) return;
        setEditingWorkOrder(null);
    };

    const handleEditChange = (event) => {
        const { name, value } = event.target;
        setEditForm(previous => ({ ...previous, [name]: value }));
    };

    const handleUpdateWorkOrder = async (event) => {
        event.preventDefault();
        if (!editingWorkOrder || !canManageWorkOrders) return;

        if (!editForm.serviceType) {
            alert("Please select a Service Type.");
            return;
        }

        setUpdatingWorkOrder(true);
        try {
            const payload = {
                serviceRequestId: editingWorkOrder.serviceRequestId ? Number(editingWorkOrder.serviceRequestId) : null,
                technicianId: editingWorkOrder.technicianId ? Number(editingWorkOrder.technicianId) : (editingWorkOrder.technician?.id ? Number(editingWorkOrder.technician.id) : null),
                customerId: editingWorkOrder.customerId ? Number(editingWorkOrder.customerId) : null,
                siteId: editingWorkOrder.siteId ? Number(editingWorkOrder.siteId) : null,
                title: editForm.title,
                serviceType: editForm.serviceType,
                priority: editForm.priority,
                description: editForm.description,
                scheduledDate: editForm.scheduledDate || null,
                completedDate: editForm.completedDate || null,
                totalCost: editForm.totalCost === "" ? 0 : Number(editForm.totalCost)
            };

            await updateWorkOrder(editingWorkOrder.id, payload);
            alert("Work order updated successfully! 🎉");
            setEditingWorkOrder(null);
            await loadWorkOrders();
        } catch (error) {
            console.error("Failed to update work order:", error);
            alert("Failed to update work order.\\n\\n" + error.message);
        } finally {
            setUpdatingWorkOrder(false);
        }
    };


    // =====================================================
    // ASSIGN / REASSIGN TECHNICIAN
    // =====================================================

    const handleAssignTechnician = async (
        workOrderId
    ) => {

        if (!canManageWorkOrders) {

            alert(
                "You do not have permission to assign technicians."
            );

            return;

        }


        const technicianId =
            selectedTechnicians[
                workOrderId
            ];


        if (!technicianId) {

            alert(
                "Please select a technician first."
            );

            return;

        }


        setAssigningId(
            workOrderId
        );


        try {

            console.log(
                "Assigning technician:",
                {
                    workOrderId,
                    technicianId
                }
            );


            await assignTechnician(
                workOrderId,
                Number(
                    technicianId
                )
            );


            alert(
                "Technician assigned successfully! 🎉"
            );


            await loadWorkOrders();


            setSelectedTechnicians(
                previous => ({

                    ...previous,

                    [workOrderId]:
                        String(
                            technicianId
                        )

                })
            );


        } catch (error) {

            console.error(
                "Failed to assign technician:",
                error
            );


            alert(
                "Failed to assign technician.\n\n" +
                error.message
            );

        } finally {

            setAssigningId(
                null
            );

        }

    };


    // =====================================================
    // TECHNICIAN NAME
    // =====================================================

    const getTechnicianName = (
        technicianId
    ) => {

        if (!technicianId) {

            return "Unassigned";

        }


        const technician =
            technicians.find(
                item =>
                    String(
                        item.id
                    ) ===
                    String(
                        technicianId
                    )
            );


        if (!technician) {

            return `Technician ${technicianId}`;

        }


        return (
            technician.name ||
            technician.fullName ||
            technician.username ||
            `Technician ${technician.id}`
        );

    };


    // =====================================================
    // SITE NAME
    // =====================================================

    const getSiteName = (
        order
    ) => {

        if (!order?.siteId) {

            return "No site";

        }


        if (
            siteNames[
                order.siteId
            ]
        ) {

            return siteNames[
                order.siteId
            ];

        }


        if (
            order.site?.siteName
        ) {

            return order.site.siteName;

        }


        if (
            order.site?.name
        ) {

            return order.site.name;

        }


        return `Site ${order.siteId}`;

    };


    // =====================================================
    // INVENTORY PART
    // =====================================================

    const getInventoryPart = (
        partId
    ) => {

        return inventoryParts.find(
            part =>
                Number(
                    part.id
                ) ===
                Number(
                    partId
                )
        );

    };


    // =====================================================
    // PARTS FOR WORK ORDER
    // =====================================================

    const getPartsForWorkOrder = (
        workOrderId
    ) => {

        return (
            partUsages[
                workOrderId
            ] || []
        );

    };


    // =====================================================
    // PARTS TOTAL
    // =====================================================

    const getPartsTotal = (
        workOrderId
    ) => {

        return getPartsForWorkOrder(
            workOrderId
        ).reduce(
            (
                total,
                usage
            ) =>
                total +
                Number(
                    usage.totalCost || 0
                ),
            0
        );

    };


    // =====================================================
    // STATUS CLASS
    // =====================================================

    const statusClass = (
        status
    ) => {

        switch (
            status
        ) {

            case "COMPLETED":
                return "status-completed";

            case "IN_PROGRESS":
                return "status-progress";

            case "ASSIGNED":
                return "status-assigned";

            case "CANCELLED":
                return "status-cancelled";

            default:
                return "status-pending";

        }

    };


    // =====================================================
    // PRIORITY CLASS
    // =====================================================

    const priorityClass = (
        priority
    ) => {

        switch (
            priority
        ) {

            case "URGENT":
                return "priority-urgent";

            case "HIGH":
                return "priority-high";

            case "LOW":
                return "priority-low";

            default:
                return "priority-medium";

        }

    };


    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDate = (
        date
    ) => {

        if (!date) {

            return "Not scheduled";

        }


        return new Date(
            date
        ).toLocaleString(
            "en-IN"
        );

    };


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <>
            <div className="work-order-page">


            {/* HEADER */}

            <div className="work-order-header">

                <div>

                    <div className="inventory-inspired-title-row">
                        <div className="inventory-inspired-icon">▣</div>
                        <div>
                            <span className="inventory-inspired-eyebrow">OPERATIONS • FIELDSYNC</span>
                            <h1>
                                Work Orders
                            </h1>

                            <p>

                                {isTechnician
                                    ? "View work orders assigned to you"
                                    : isCustomer
                                        ? "View your work orders"
                                        : "Create and manage field service work orders"}

                            </p>
                        </div>
                    </div>

                </div>


                <div className="work-order-count">

                    {workOrders.length} Work Orders

                </div>

            </div>


            {/* CREATE WORK ORDER */}

            {canManageWorkOrders && (

                <div className="work-order-card">

                    <div className="card-title">

                        <h2>
                            Create Work Order
                        </h2>

                        <p>
                            Create a work order from a service request
                        </p>

                    </div>


                    <form
                        onSubmit={
                            handleSubmit
                        }
                    >

                        <div className="form-grid">


                            {/* SERVICE REQUEST */}

                            <div className="form-group full-width">

                                <label>
                                    Service Request
                                </label>

                                <select
                                    name="serviceRequestId"
                                    value={
                                        form.serviceRequestId
                                    }
                                    onChange={
                                        handleServiceRequestChange
                                    }
                                    required
                                >

                                    <option value="">
                                        Select Service Request
                                    </option>


                                    {serviceRequests.map(
                                        request => (

                                            <option
                                                key={
                                                    request.id
                                                }
                                                value={
                                                    request.id
                                                }
                                            >

                                                #{request.id} -{" "}

                                                {
                                                    request.title ||
                                                    request.serviceType
                                                }

                                                {" - Customer "}

                                                {
                                                    request.customerId
                                                }

                                            </option>

                                        )
                                    )}

                                </select>

                            </div>


                            {/* CUSTOMER */}

                            <div className="form-group">

                                <label>
                                    Customer ID
                                </label>

                                <input
                                    type="number"
                                    name="customerId"
                                    value={
                                        form.customerId
                                    }
                                    readOnly
                                />

                                <span className="field-hint">
                                    Automatically selected from the service request
                                </span>

                            </div>


                            {/* SITE */}

                            <div className="form-group">

                                <label>
                                    Service Site
                                </label>

                                <select
                                    name="siteId"
                                    value={
                                        form.siteId
                                    }
                                    onChange={
                                        handleSiteChange
                                    }
                                    required
                                    disabled={
                                        !form.customerId
                                    }
                                >

                                    <option value="">

                                        {
                                            form.customerId
                                                ? "Select Existing Site"
                                                : "Select Service Request First"
                                        }

                                    </option>


                                    {sites.map(
                                        site => (

                                            <option
                                                key={
                                                    site.id
                                                }
                                                value={
                                                    site.id
                                                }
                                            >

                                                {
                                                    site.siteName ||
                                                    site.name ||
                                                    site.address ||
                                                    `Site ${site.id}`
                                                }

                                            </option>

                                        )
                                    )}


                                    {form.customerId && (

                                        <option value="__NEW_SITE__">

                                            ➕ Create New Site

                                        </option>

                                    )}

                                </select>


                                {form.customerId && (

                                    <span className="field-hint">

                                        Select an existing customer site or create a new one.

                                    </span>

                                )}

                            </div>


                            {/* NEW SITE PANEL */}

                            {showNewSiteForm && (

                                <div className="new-site-panel full-width">

                                    <div className="new-site-header">

                                        <div>

                                            <h3>
                                                Create New Service Site
                                            </h3>

                                            <p>
                                                This site will be linked to Customer {form.customerId}.
                                            </p>

                                        </div>

                                        <button
                                            type="button"
                                            className="close-site-btn"
                                            onClick={
                                                handleCancelNewSite
                                            }
                                        >
                                            ×
                                        </button>

                                    </div>


                                    <div className="new-site-grid">


                                        {/* SITE NAME */}

                                        <div className="form-group">

                                            <label>
                                                Site Name *
                                            </label>

                                            <input
                                                type="text"
                                                name="siteName"
                                                value={
                                                    newSite.siteName
                                                }
                                                onChange={
                                                    handleNewSiteChange
                                                }
                                                placeholder="Hyderabad Main Office"
                                                maxLength="255"
                                                required
                                            />

                                        </div>


                                        {/* CONTACT PERSON */}

                                        <div className="form-group">

                                            <label>
                                                Contact Person
                                            </label>

                                            <input
                                                type="text"
                                                name="contactPerson"
                                                value={
                                                    newSite.contactPerson
                                                }
                                                onChange={
                                                    handleNewSiteChange
                                                }
                                                placeholder="Site Contact Person"
                                            />

                                        </div>


                                        {/* CONTACT PHONE */}

                                        <div className="form-group">

                                            <label>
                                                Contact Phone
                                            </label>

                                            <input
                                                type="text"
                                                name="contactPhone"
                                                value={
                                                    newSite.contactPhone
                                                }
                                                onChange={
                                                    handleNewSiteChange
                                                }
                                                placeholder="9876543210"
                                            />

                                        </div>


                                        {/* ADDRESS */}

                                        <div className="form-group">

                                            <label>
                                                Address
                                            </label>

                                            <input
                                                type="text"
                                                name="address"
                                                value={
                                                    newSite.address
                                                }
                                                onChange={
                                                    handleNewSiteChange
                                                }
                                                placeholder="Hitech City, Hyderabad"
                                            />

                                        </div>


                                        {/* CITY */}

                                        <div className="form-group">

                                            <label>
                                                City
                                            </label>

                                            <input
                                                type="text"
                                                name="city"
                                                value={
                                                    newSite.city
                                                }
                                                onChange={
                                                    handleNewSiteChange
                                                }
                                                placeholder="Hyderabad"
                                            />

                                        </div>


                                        {/* STATE */}

                                        <div className="form-group">

                                            <label>
                                                State
                                            </label>

                                            <input
                                                type="text"
                                                name="state"
                                                value={
                                                    newSite.state
                                                }
                                                onChange={
                                                    handleNewSiteChange
                                                }
                                                placeholder="Telangana"
                                            />

                                        </div>


                                        {/* ZIP CODE */}

                                        <div className="form-group">

                                            <label>
                                                ZIP Code
                                            </label>

                                            <input
                                                type="text"
                                                name="zipCode"
                                                value={
                                                    newSite.zipCode
                                                }
                                                onChange={
                                                    handleNewSiteChange
                                                }
                                                placeholder="500081"
                                            />

                                        </div>

                                    </div>


                                    <div className="new-site-actions">

                                        <button
                                            type="button"
                                            className="cancel-site-btn"
                                            onClick={
                                                handleCancelNewSite
                                            }
                                            disabled={
                                                savingSite
                                            }
                                        >
                                            Cancel
                                        </button>


                                        <button
                                            type="button"
                                            className="save-site-btn"
                                            onClick={
                                                handleCreateNewSite
                                            }
                                            disabled={
                                                savingSite
                                            }
                                        >

                                            {savingSite
                                                ? "Saving Site..."
                                                : "✓ Save Site & Continue"}

                                        </button>

                                    </div>

                                </div>

                            )}


                            {/* TECHNICIAN */}

                            <div className="form-group">

                                <label>
                                    Technician
                                </label>

                                <select
                                    name="technicianId"
                                    value={
                                        form.technicianId
                                    }
                                    onChange={
                                        handleChange
                                    }
                                >

                                    <option value="">
                                        Unassigned
                                    </option>


                                    {technicians.map(
                                        technician => (

                                            <option
                                                key={
                                                    technician.id
                                                }
                                                value={
                                                    technician.id
                                                }
                                            >

                                                {
                                                    technician.name ||
                                                    technician.fullName ||
                                                    technician.username ||
                                                    `Technician ${technician.id}`
                                                }

                                            </option>

                                        )
                                    )}

                                </select>

                            </div>


                            {/* TITLE */}

                            <div className="form-group">

                                <label>
                                    Title
                                </label>

                                <input
                                    name="title"
                                    value={
                                        form.title
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                />

                            </div>


                            {/* SERVICE LOCATION */}

                            <div className="form-group">

                                <label>
                                    Service Location
                                </label>

                                <input
                                    type="text"
                                    value={
                                        form.serviceLocation
                                    }
                                    readOnly
                                />

                            </div>


                            {/* SERVICE TYPE */}

                            <div className="form-group">

                                <label>
                                    Service Type
                                </label>

                                <select
                                    name="serviceType"
                                    value={form.serviceType}
                                    onChange={handleChange}
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


                            {/* PRIORITY */}

                            <div className="form-group">

                                <label>
                                    Priority
                                </label>

                                <select
                                    name="priority"
                                    value={
                                        form.priority
                                    }
                                    onChange={
                                        handleChange
                                    }
                                >

                                    <option value="LOW">
                                        LOW
                                    </option>

                                    <option value="MEDIUM">
                                        MEDIUM
                                    </option>

                                    <option value="HIGH">
                                        HIGH
                                    </option>

                                    <option value="URGENT">
                                        URGENT
                                    </option>

                                </select>

                            </div>


                            {/* STATUS */}

                            <div className="form-group">

                                <label>
                                    Status
                                </label>

                                <select
                                    name="status"
                                    value={
                                        form.status
                                    }
                                    onChange={
                                        handleChange
                                    }
                                >

                                    <option value="PENDING">
                                        PENDING
                                    </option>

                                    <option value="ASSIGNED">
                                        ASSIGNED
                                    </option>

                                    <option value="IN_PROGRESS">
                                        IN PROGRESS
                                    </option>

                                    <option value="COMPLETED">
                                        COMPLETED
                                    </option>

                                    <option value="CANCELLED">
                                        CANCELLED
                                    </option>

                                </select>

                            </div>


                            {/* SCHEDULED DATE */}

                            <div className="form-group">

                                <label>
                                    Scheduled Date
                                </label>

                                <input
                                    type="datetime-local"
                                    name="scheduledDate"
                                    value={
                                        form.scheduledDate
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />

                            </div>


                            {/* TOTAL COST */}

                            <div className="form-group">

                                <label>
                                    Total Cost
                                </label>

                                <input
                                    type="number"
                                    name="totalCost"
                                    placeholder="2500"
                                    min="0"
                                    step="0.01"
                                    value={
                                        form.totalCost
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />

                            </div>


                            {/* DESCRIPTION */}

                            <div className="form-group full-width">

                                <label>
                                    Description
                                </label>

                                <textarea
                                    name="description"
                                    value={
                                        form.description
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    rows="4"
                                    placeholder="Describe the work required..."
                                />

                            </div>

                        </div>


                        <div className="form-actions">

                            <button
                                type="submit"
                                className="add-work-order-btn"
                                disabled={
                                    saving ||
                                    savingSite ||
                                    showNewSiteForm
                                }
                            >

                                {saving
                                    ? "Creating..."
                                    : "+ Create Work Order"}

                            </button>

                        </div>

                    </form>

                </div>

            )}


            {/* WORK ORDER LIST */}

            <div className="work-order-list-section">

                <div className="list-header">

                    <div>

                        <h2>

                            {isTechnician
                                ? "My Assigned Work Orders"
                                : isCustomer
                                    ? "My Work Orders"
                                    : "Work Orders"}

                        </h2>

                        <p>

                            {isTechnician
                                ? "Work orders currently assigned to you"
                                : isCustomer
                                    ? "Work orders associated with your account"
                                    : "View and manage all work orders"}

                        </p>

                    </div>

                </div>


                {loading ? (

                    <div className="loading">
                        Loading work orders...
                    </div>

                ) : workOrders.length === 0 ? (

                    <div className="empty-state">

                        <h3>
                            No Work Orders Found
                        </h3>

                        <p>

                            {isTechnician
                                ? "You currently have no assigned work orders."
                                : isCustomer
                                    ? "You currently have no work orders."
                                    : "Create your first work order above."}

                        </p>

                    </div>

                ) : (

                    <div className="work-order-grid">

                        {workOrders.map(
                            order => {

                                const isAssigned =
                                    Boolean(
                                        order.technicianId ||
                                        order.technician?.id
                                    );


                                const currentTechnicianId =
                                    order.technicianId ??
                                    order.technician?.id ??
                                    "";


                                const orderParts =
                                    getPartsForWorkOrder(
                                        order.id
                                    );


                                const partsTotal =
                                    getPartsTotal(
                                        order.id
                                    );


                                return (

                                    <div
                                        className="work-order-item"
                                        key={
                                            order.id
                                        }
                                    >

                                        <div className="work-order-top">

                                            <div>

                                                <span className="order-number">

                                                    {
                                                        order.orderNumber
                                                    }

                                                </span>

                                                <h3>

                                                    {
                                                        order.title ||
                                                        "Work Order"
                                                    }

                                                </h3>

                                            </div>


                                            {canManageWorkOrders && (
                                                <button
                                                    type="button"
                                                    className="edit-work-order-btn"
                                                    onClick={() => openEditModal(order)}
                                                >
                                                    Edit
                                                </button>
                                            )}

                                            <span
                                                className={`status-badge ${statusClass(
                                                    order.status
                                                )}`}
                                            >

                                                {
                                                    order.status
                                                }

                                            </span>

                                        </div>


                                        <div className="work-order-details">


                                            <p>

                                                <strong>
                                                    Service Request:
                                                </strong>{" "}

                                                {order.serviceRequestId
                                                    ? `#${order.serviceRequestId}`
                                                    : "N/A"}

                                            </p>


                                            <p>

                                                <strong>
                                                    Customer:
                                                </strong>{" "}

                                                {
                                                    order.customerId
                                                }

                                            </p>


                                            <p className="site-detail">

                                                <strong>
                                                    Site:
                                                </strong>{" "}

                                                <span className="site-name-display">

                                                    🏢{" "}

                                                    {
                                                        getSiteName(
                                                            order
                                                        )
                                                    }

                                                </span>

                                            </p>


                                            <p>

                                                <strong>
                                                    Technician:
                                                </strong>{" "}

                                                {
                                                    getTechnicianName(
                                                        currentTechnicianId
                                                    )
                                                }

                                            </p>


                                            <p>

                                                <strong>
                                                    Priority:
                                                </strong>{" "}

                                                <span
                                                    className={`priority-badge ${priorityClass(
                                                        order.priority
                                                    )}`}
                                                >

                                                    {
                                                        order.priority
                                                    }

                                                </span>

                                            </p>


                                            <p>

                                                <strong>
                                                    Scheduled:
                                                </strong>{" "}

                                                {
                                                    formatDate(
                                                        order.scheduledDate
                                                    )
                                                }

                                            </p>


                                            <p>

                                                <strong>
                                                    Cost:
                                                </strong>{" "}

                                                ₹

                                                {Number(
                                                    order.totalCost || 0
                                                ).toFixed(2)}

                                            </p>


                                            {order.description && (

                                                <p className="description">

                                                    <strong>
                                                        Description:
                                                    </strong>{" "}

                                                    {
                                                        order.description
                                                    }

                                                </p>

                                            )}


                                            {/* =================================================
                                                PARTS USED
                                            ================================================= */}

                                            <div className="work-order-parts-section">

                                                <div className="work-order-parts-header">

                                                    <strong>
                                                        🔧 Parts Used
                                                    </strong>


                                                    <span>
                                                        {
                                                            orderParts.length
                                                        }
                                                    </span>

                                                </div>


                                                {orderParts.length === 0 ? (

                                                    <div className="work-order-no-parts">

                                                        No parts recorded for this work order.

                                                    </div>

                                                ) : (

                                                    <div className="work-order-parts-list">

                                                        {orderParts.map(
                                                            usage => {

                                                                const part =
                                                                    getInventoryPart(
                                                                        usage.inventoryPartId
                                                                    );


                                                                return (

                                                                    <div
                                                                        className="work-order-part-row"
                                                                        key={
                                                                            usage.id
                                                                        }
                                                                    >

                                                                        <div className="work-order-part-info">

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


                                                                        <div className="work-order-part-value">

                                                                            <small>
                                                                                QTY
                                                                            </small>


                                                                            <strong>
                                                                                {
                                                                                    usage.quantityUsed
                                                                                }
                                                                            </strong>

                                                                        </div>


                                                                        <div className="work-order-part-value">

                                                                            <small>
                                                                                UNIT PRICE
                                                                            </small>


                                                                            <strong>
                                                                                ₹
                                                                                {
                                                                                    Number(
                                                                                        usage.unitPrice || 0
                                                                                    ).toFixed(2)
                                                                                }
                                                                            </strong>

                                                                        </div>


                                                                        <div className="work-order-part-value">

                                                                            <small>
                                                                                TOTAL
                                                                            </small>


                                                                            <strong>
                                                                                ₹
                                                                                {
                                                                                    Number(
                                                                                        usage.totalCost || 0
                                                                                    ).toFixed(2)
                                                                                }
                                                                            </strong>

                                                                        </div>

                                                                    </div>

                                                                );

                                                            }
                                                        )}


                                                        <div className="work-order-parts-total">

                                                            <span>
                                                                Total Parts Cost
                                                            </span>


                                                            <strong>
                                                                ₹
                                                                {
                                                                    partsTotal.toFixed(
                                                                        2
                                                                    )
                                                                }
                                                            </strong>

                                                        </div>

                                                    </div>

                                                )}

                                            </div>


                                            {/* =================================================
                                                ASSIGN / REASSIGN TECHNICIAN
                                            ================================================= */}

                                            {canManageWorkOrders && (

                                                <div className="assign-technician-section">

                                                    <label>

                                                        {isAssigned
                                                            ? "Change Technician"
                                                            : "Assign Technician"}

                                                    </label>


                                                    <div className="assign-technician-controls">

                                                        <select
                                                            value={
                                                                selectedTechnicians[
                                                                    order.id
                                                                ] ??
                                                                (
                                                                    currentTechnicianId
                                                                        ? String(
                                                                            currentTechnicianId
                                                                        )
                                                                        : ""
                                                                )
                                                            }
                                                            onChange={
                                                                event =>
                                                                    setSelectedTechnicians(
                                                                        previous => ({

                                                                            ...previous,

                                                                            [order.id]:
                                                                                event.target.value

                                                                        })
                                                                    )
                                                            }
                                                            disabled={
                                                                assigningId ===
                                                                order.id
                                                            }
                                                        >

                                                            <option value="">

                                                                Select Technician

                                                            </option>


                                                            {technicians.map(
                                                                technician => (

                                                                    <option
                                                                        key={
                                                                            technician.id
                                                                        }
                                                                        value={
                                                                            technician.id
                                                                        }
                                                                    >

                                                                        {
                                                                            technician.name ||
                                                                            technician.fullName ||
                                                                            technician.username ||
                                                                            `Technician ${technician.id}`
                                                                        }

                                                                    </option>

                                                                )
                                                            )}

                                                        </select>


                                                        <button
                                                            type="button"
                                                            className="assign-technician-btn"
                                                            onClick={() =>
                                                                handleAssignTechnician(
                                                                    order.id
                                                                )
                                                            }
                                                            disabled={
                                                                assigningId ===
                                                                order.id
                                                            }
                                                        >

                                                            {assigningId ===
                                                            order.id

                                                                ? "Assigning..."

                                                                : isAssigned

                                                                    ? "Reassign"

                                                                    : "Assign"}

                                                        </button>

                                                    </div>

                                                </div>

                                            )}

                                        </div>

                                    </div>

                                );

                            }
                        )}

                    </div>

                )}

            </div>

        </div>

        {editingWorkOrder && canManageWorkOrders && (
            <div className="work-order-modal-backdrop" onMouseDown={closeEditModal}>
                <div className="work-order-edit-modal" role="dialog" aria-modal="true" aria-labelledby="edit-work-order-title" onMouseDown={event => event.stopPropagation()}>
                    <div className="work-order-modal-header">
                        <div>
                            <span className="work-order-modal-eyebrow">WORK ORDER #{editingWorkOrder.orderNumber || editingWorkOrder.id}</span>
                            <h2 id="edit-work-order-title">Edit Work Order</h2>
                            <p>Update the work order details and service type.</p>
                        </div>
                        <button type="button" className="work-order-modal-close" onClick={closeEditModal} disabled={updatingWorkOrder}>×</button>
                    </div>

                    <form onSubmit={handleUpdateWorkOrder}>
                        <div className="work-order-edit-grid">
                            <div className="edit-form-group">
                                <label htmlFor="edit-title">Title</label>
                                <input id="edit-title" name="title" value={editForm.title} onChange={handleEditChange} required />
                            </div>
                            <div className="edit-form-group">
                                <label htmlFor="edit-service-type">Service Type</label>
                                <select id="edit-service-type" name="serviceType" value={editForm.serviceType} onChange={handleEditChange} required>
                                    <option value="">Select Service Type</option>
                                    {serviceTypeOptions.map(option => <option key={option} value={option}>{option}</option>)}
                                </select>
                            </div>
                            <div className="edit-form-group">
                                <label htmlFor="edit-priority">Priority</label>
                                <select id="edit-priority" name="priority" value={editForm.priority} onChange={handleEditChange}>
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                    <option value="URGENT">Urgent</option>
                                </select>
                            </div>
                            <div className="edit-form-group">
                                <label htmlFor="edit-scheduled-date">Scheduled Date</label>
                                <input id="edit-scheduled-date" type="datetime-local" name="scheduledDate" value={editForm.scheduledDate} onChange={handleEditChange} />
                            </div>
                            <div className="edit-form-group">
                                <label htmlFor="edit-completed-date">Completed Date</label>
                                <input id="edit-completed-date" type="datetime-local" name="completedDate" value={editForm.completedDate} onChange={handleEditChange} />
                            </div>
                            <div className="edit-form-group">
                                <label htmlFor="edit-total-cost">Total Cost</label>
                                <input id="edit-total-cost" type="number" min="0" step="0.01" name="totalCost" value={editForm.totalCost} onChange={handleEditChange} placeholder="0.00" />
                            </div>
                            <div className="edit-form-group full-width">
                                <label htmlFor="edit-description">Description</label>
                                <textarea id="edit-description" name="description" value={editForm.description} onChange={handleEditChange} rows="4" placeholder="Describe the work required..." />
                            </div>
                        </div>
                        <div className="work-order-modal-actions">
                            <button type="button" className="work-order-modal-cancel" onClick={closeEditModal} disabled={updatingWorkOrder}>Cancel</button>
                            <button type="submit" className="work-order-modal-save" disabled={updatingWorkOrder}>{updatingWorkOrder ? "Saving..." : "Save Changes"}</button>
                        </div>
                    </form>
                </div>
            </div>
        )}
        </>

    );

}


export default WorkOrders;