package com.fsm.service;

import com.fsm.entity.Site;
import com.fsm.repository.SiteRepository;
import com.fsm.security.AuthorizationService;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SiteService {

    private final SiteRepository siteRepository;
    private final AuthorizationService authorizationService;

    public SiteService(
            SiteRepository siteRepository,
            AuthorizationService authorizationService
    ) {
        this.siteRepository = siteRepository;
        this.authorizationService = authorizationService;
    }

    // =========================================================
    // GET ALL SITES
    // =========================================================

    public List<Site> getAllSites() {

        // Customers must NEVER receive all customers' sites
        if (authorizationService.hasRole("CUSTOMER")) {

            Long customerId =
                    authorizationService.getCurrentCustomerId();

            return siteRepository.findByCustomerId(customerId);
        }

        // Dispatcher, Manager and Technician
        // can use the general site list.
        return siteRepository.findAll();
    }

    // =========================================================
    // GET SITES BY CUSTOMER
    // =========================================================

    public List<Site> getSitesByCustomer(Long customerId) {

        // Customer can only access their own sites
        if (authorizationService.hasRole("CUSTOMER")) {

            Long currentCustomerId =
                    authorizationService.getCurrentCustomerId();

            if (!currentCustomerId.equals(customerId)) {

                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "You don't have permission to access this customer's sites"
                );
            }
        }

        return siteRepository.findByCustomerId(customerId);
    }

    // =========================================================
    // GET SITE BY ID
    // =========================================================

    public Site getSiteById(Long id) {

        Site site =
                siteRepository.findById(id)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Site not found with id: " + id
                                )
                        );

        // Customer can only see their own site
        if (authorizationService.hasRole("CUSTOMER")) {

            Long currentCustomerId =
                    authorizationService.getCurrentCustomerId();

            if (!currentCustomerId.equals(
                    site.getCustomerId()
            )) {

                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "You don't have permission to access this site"
                );
            }
        }

        return site;
    }

    // =========================================================
    // CREATE SITE
    // =========================================================

    public Site createSite(Site site) {

        if (site.getCustomerId() == null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Customer ID is required"
            );
        }

        if (site.getSiteName() == null ||
                site.getSiteName().trim().isEmpty()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Site name is required"
            );
        }

        String siteName =
                site.getSiteName().trim();

        // Prevent duplicate site names
        // for the same customer
        if (siteRepository
                .existsByCustomerIdAndSiteNameIgnoreCase(
                        site.getCustomerId(),
                        siteName
                )) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "A site with this name already exists for this customer"
            );
        }

        site.setSiteName(siteName);

        if (site.getCreatedAt() == null) {
            site.setCreatedAt(LocalDateTime.now());
        }

        return siteRepository.save(site);
    }

    // =========================================================
    // UPDATE SITE
    // =========================================================

    public Site updateSite(
            Long id,
            Site siteDetails
    ) {

        Site existingSite =
                siteRepository.findById(id)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Site not found with id: " + id
                                )
                        );

        if (siteDetails.getCustomerId() == null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Customer ID is required"
            );
        }

        if (siteDetails.getSiteName() == null ||
                siteDetails.getSiteName().trim().isEmpty()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Site name is required"
            );
        }

        String siteName =
                siteDetails.getSiteName().trim();

        // Prevent duplicate site names
        // when updating
        if (siteRepository
                .existsByCustomerIdAndSiteNameIgnoreCaseAndIdNot(
                        siteDetails.getCustomerId(),
                        siteName,
                        id
                )) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "A site with this name already exists for this customer"
            );
        }

        existingSite.setCustomerId(
                siteDetails.getCustomerId()
        );

        existingSite.setSiteName(
                siteName
        );

        existingSite.setContactPerson(
                siteDetails.getContactPerson()
        );

        existingSite.setContactPhone(
                siteDetails.getContactPhone()
        );

        existingSite.setAddress(
                siteDetails.getAddress()
        );

        existingSite.setCity(
                siteDetails.getCity()
        );

        existingSite.setState(
                siteDetails.getState()
        );

        existingSite.setZipCode(
                siteDetails.getZipCode()
        );

        return siteRepository.save(existingSite);
    }

    // =========================================================
    // DELETE SITE
    // =========================================================

    public void deleteSite(Long id) {

        Site site =
                siteRepository.findById(id)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Site not found with id: " + id
                                )
                        );

        siteRepository.delete(site);
    }
}