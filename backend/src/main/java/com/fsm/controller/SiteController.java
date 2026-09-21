package com.fsm.controller;

import com.fsm.entity.Site;
import com.fsm.service.SiteService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sites")
@CrossOrigin(origins = "http://localhost:5174")
public class SiteController {

    private final SiteService siteService;

    public SiteController(
            SiteService siteService
    ) {
        this.siteService = siteService;
    }

    // =========================================================
    // GET ALL SITES
    // =========================================================

    @GetMapping
    public ResponseEntity<List<Site>> getAllSites() {

        return ResponseEntity.ok(
                siteService.getAllSites()
        );
    }

    // =========================================================
    // GET SITES BY CUSTOMER
    // =========================================================

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Site>> getSitesByCustomer(
            @PathVariable Long customerId
    ) {

        return ResponseEntity.ok(
                siteService.getSitesByCustomer(
                        customerId
                )
        );
    }

    // =========================================================
    // CREATE SITE FOR CUSTOMER
    // =========================================================

    @PostMapping("/customer/{customerId}")
    public ResponseEntity<Site> createSite(
            @PathVariable Long customerId,
            @RequestBody Site site
    ) {

        // Always use the customer ID from the URL
        // rather than trusting the request body.
        site.setCustomerId(customerId);

        Site savedSite =
                siteService.createSite(site);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedSite);
    }

    // =========================================================
    // GET SITE BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<Site> getSiteById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                siteService.getSiteById(id)
        );
    }

    // =========================================================
    // UPDATE SITE
    // =========================================================

    @PutMapping("/{id}")
    public ResponseEntity<Site> updateSite(
            @PathVariable Long id,
            @RequestBody Site site
    ) {

        return ResponseEntity.ok(
                siteService.updateSite(
                        id,
                        site
                )
        );
    }

    // =========================================================
    // DELETE SITE
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSite(
            @PathVariable Long id
    ) {

        siteService.deleteSite(id);

        return ResponseEntity
                .noContent()
                .build();
    }
}