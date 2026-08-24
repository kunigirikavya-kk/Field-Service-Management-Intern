package com.fsm.service;

import com.fsm.entity.Site;
import com.fsm.repository.SiteRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SiteService {

    private final SiteRepository siteRepository;

    public SiteService(SiteRepository siteRepository) {
        this.siteRepository = siteRepository;
    }

    // Get all sites
    public List<Site> getAllSites() {
        return siteRepository.findAll();
    }

    // Get sites by customer
    public List<Site> getSitesByCustomer(Long customerId) {
        return siteRepository.findByCustomerId(customerId);
    }

    // Get site by ID
    public Site getSiteById(Long id) {
        return siteRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Site not found with id: " + id));
    }

    // Create site
    public Site createSite(Site site) {

        if (site.getCreatedAt() == null) {
            site.setCreatedAt(java.time.LocalDateTime.now());
        }

        return siteRepository.save(site);
    }

    // Update site
    public Site updateSite(Long id, Site siteDetails) {

        Site site = getSiteById(id);

        site.setCustomerId(siteDetails.getCustomerId());
        site.setSiteName(siteDetails.getSiteName());
        site.setContactPerson(siteDetails.getContactPerson());
        site.setContactPhone(siteDetails.getContactPhone());
        site.setAddress(siteDetails.getAddress());
        site.setCity(siteDetails.getCity());
        site.setState(siteDetails.getState());
        site.setZipCode(siteDetails.getZipCode());

        return siteRepository.save(site);
    }

    // Delete site
    public void deleteSite(Long id) {

        Site site = getSiteById(id);

        siteRepository.delete(site);
    }
}