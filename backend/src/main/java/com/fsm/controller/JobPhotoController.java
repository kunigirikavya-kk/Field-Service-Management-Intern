package com.fsm.controller;

import com.fsm.entity.JobExecution;
import com.fsm.entity.ServiceRequest;
import com.fsm.entity.WorkOrder;
import com.fsm.entity.JobPhoto.PhotoType;
import com.fsm.entity.JobPhoto;
import com.fsm.repository.JobExecutionRepository;
import com.fsm.repository.ServiceRequestRepository;
import com.fsm.repository.WorkOrderRepository;
import com.fsm.repository.JobPhotoRepository;
import com.fsm.service.CloudinaryService;
import com.fsm.security.AuthorizationService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/job-photos")
public class JobPhotoController {

    private final CloudinaryService cloudinaryService;

    private final JobPhotoRepository jobPhotoRepository;

    private final JobExecutionRepository jobExecutionRepository;

    private final AuthorizationService authorizationService;
    private final ServiceRequestRepository serviceRequestRepository;
    private final WorkOrderRepository workOrderRepository;


    public JobPhotoController(
            CloudinaryService cloudinaryService,
            JobPhotoRepository jobPhotoRepository,
            JobExecutionRepository jobExecutionRepository,
            AuthorizationService authorizationService,
            ServiceRequestRepository serviceRequestRepository,
            WorkOrderRepository workOrderRepository
    ) {

        this.cloudinaryService =
                cloudinaryService;

        this.jobPhotoRepository =
                jobPhotoRepository;

        this.jobExecutionRepository =
                jobExecutionRepository;

        this.authorizationService =
                authorizationService;
        this.serviceRequestRepository =
                serviceRequestRepository;
        this.workOrderRepository =
                workOrderRepository;
    }


    // =====================================================
    // UPLOAD PHOTO FOR SPECIFIC JOB EXECUTION
    // =====================================================

    @PostMapping("/upload")
    public ResponseEntity<?> uploadPhoto(

            @RequestParam("file")
            MultipartFile file,

            @RequestParam("jobExecutionId")
            Long jobExecutionId

    ) {

        try {

            if (file == null || file.isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Please select an image."
                        );
            }


            if (
                    file.getContentType() == null ||
                    !file.getContentType()
                            .startsWith("image/")
            ) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Only image files are allowed."
                        );
            }


            if (
                    file.getSize() >
                    10 * 1024 * 1024
            ) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Image size must be 10 MB or less."
                        );
            }


            // =================================================
            // FIND EXECUTION
            // =================================================

            JobExecution execution =
                    jobExecutionRepository
                            .findById(
                                    jobExecutionId
                            )
                            .orElseThrow(
                                    () ->
                                            new RuntimeException(
                                                    "Job execution not found with id: "
                                                            + jobExecutionId
                                            )
                            );


            // =================================================
            // TECHNICIAN OWNERSHIP
            // =================================================

            if (
                    authorizationService
                            .hasRole("TECHNICIAN")
            ) {

                if (
                        !authorizationService
                                .isCurrentTechnician(
                                        execution.getTechnicianId()
                                )
                ) {

                    return ResponseEntity
                            .status(403)
                            .body(
                                    "You are not allowed to upload a photo for another technician's job."
                            );
                }
            }


            // =================================================
            // CLOUDINARY UPLOAD
            // =================================================

            Map uploadResult =
                    cloudinaryService
                            .uploadImage(file);


            String imageUrl =
                    uploadResult
                            .get("secure_url")
                            .toString();


            String publicId =
                    uploadResult
                            .get("public_id")
                            .toString();


            // =================================================
            // CREATE PHOTO RECORD
            // =================================================

            JobPhoto jobPhoto =
                    new JobPhoto();


            jobPhoto.setJobExecutionId(
                    execution.getId()
            );
            jobPhoto.setPhotoType(PhotoType.WORK_COMPLETION);


            jobPhoto.setWorkOrderId(
                    execution.getWorkOrderId()
            );


            jobPhoto.setTechnicianId(
                    execution.getTechnicianId()
            );


            jobPhoto.setImageUrl(
                    imageUrl
            );


            jobPhoto.setPublicId(
                    publicId
            );


            JobPhoto savedPhoto =
                    jobPhotoRepository.save(
                            jobPhoto
                    );


            return ResponseEntity.ok(
                    savedPhoto
            );


        } catch (IOException e) {

            return ResponseEntity
                    .internalServerError()
                    .body(
                            "Image upload failed: "
                                    + e.getMessage()
                    );


        } catch (Exception e) {

            return ResponseEntity
                    .internalServerError()
                    .body(
                            "Something went wrong: "
                                    + e.getMessage()
                    );
        }
    }


    // =====================================================
    // CUSTOMER REQUEST PHOTO UPLOAD

    @PostMapping("/service-request/upload")
    public ResponseEntity<?> uploadServiceRequestPhoto(
            @RequestParam("file") MultipartFile file,
            @RequestParam("serviceRequestId") Long serviceRequestId) {
        try {
            validateImage(file);
            ServiceRequest request = serviceRequestRepository.findById(serviceRequestId)
                    .orElseThrow(() -> new RuntimeException("Service request not found with id: " + serviceRequestId));

            if (authorizationService.hasRole("CUSTOMER") &&
                    !authorizationService.isCurrentCustomer(request.getCustomerId())) {
                return ResponseEntity.status(403).body("You are not allowed to upload evidence for another customer's service request.");
            }

            if (!authorizationService.hasRole("CUSTOMER") &&
                    !authorizationService.hasRole("MANAGER") &&
                    !authorizationService.hasRole("DISPATCHER")) {
                return ResponseEntity.status(403).body("You do not have permission to upload service-request evidence.");
            }

            Map uploadResult = cloudinaryService.uploadImage(file, "fieldsync/service-request-photos");

            JobPhoto photo = new JobPhoto();
            photo.setServiceRequestId(serviceRequestId);
            photo.setPhotoType(PhotoType.CUSTOMER_REQUEST);
            photo.setImageUrl(uploadResult.get("secure_url").toString());
            photo.setPublicId(uploadResult.get("public_id").toString());

            return ResponseEntity.ok(jobPhotoRepository.save(photo));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Image upload failed: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Something went wrong: " + e.getMessage());
        }
    }

    private void validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) throw new IllegalArgumentException("Please select an image.");
        if (file.getContentType() == null || !file.getContentType().startsWith("image/")) throw new IllegalArgumentException("Only image files are allowed.");
        if (file.getSize() > 10 * 1024 * 1024) throw new IllegalArgumentException("Image size must be 10 MB or less.");
    }

    @GetMapping("/service-request/{serviceRequestId}")
    public ResponseEntity<List<JobPhoto>> getPhotosByServiceRequest(
            @PathVariable Long serviceRequestId) {
        return ResponseEntity.ok(jobPhotoRepository.findByServiceRequestId(serviceRequestId));
    }

    // GET PHOTOS BY JOB EXECUTION
    // =====================================================

    @GetMapping(
            "/execution/{jobExecutionId}"
    )
    public ResponseEntity<List<JobPhoto>>
    getPhotosByJobExecution(
            @PathVariable Long jobExecutionId
    ) {

        return ResponseEntity.ok(
                jobPhotoRepository
                        .findByJobExecutionId(
                                jobExecutionId
                        )
        );
    }


    // =====================================================
    // GET PHOTOS BY WORK ORDER
    // =====================================================

    @GetMapping(
            "/work-order/{workOrderId}"
    )
    public ResponseEntity<List<JobPhoto>>
    getPhotosByWorkOrder(
            @PathVariable Long workOrderId
    ) {

        WorkOrder workOrder = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new RuntimeException("Work order not found with id: " + workOrderId));

        List<JobPhoto> photos = new java.util.ArrayList<>(
                jobPhotoRepository.findByWorkOrderId(workOrderId)
        );

        if (workOrder.getServiceRequestId() != null) {
            photos.addAll(
                    jobPhotoRepository.findByServiceRequestId(
                            workOrder.getServiceRequestId()
                    )
            );
        }

        return ResponseEntity.ok(photos);
    }


    // =====================================================
    // GET PHOTOS BY TECHNICIAN
    // =====================================================

    @GetMapping(
            "/technician/{technicianId}"
    )
    public ResponseEntity<List<JobPhoto>>
    getPhotosByTechnician(
            @PathVariable Long technicianId
    ) {

        return ResponseEntity.ok(
                jobPhotoRepository
                        .findByTechnicianId(
                                technicianId
                        )
        );
    }


    // =====================================================
    // GET PHOTO BY ID
    // =====================================================

    @GetMapping("/{id}")
    public ResponseEntity<JobPhoto>
    getPhotoById(
            @PathVariable Long id
    ) {

        return jobPhotoRepository
                .findById(id)
                .map(
                        ResponseEntity::ok
                )
                .orElse(
                        ResponseEntity
                                .notFound()
                                .build()
                );
    }
}