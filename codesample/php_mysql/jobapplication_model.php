<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

//include utils - bpjobapplicationmail.php to send email to store heads once the application submitted.
//BpMail class available in the below class.
require_once("bpjobapplicationmail.php");


class Bpapplication {
  	function __construct () {
  		$this->EE =& get_instance();
      //Call cleanup function to remove old uploaded files from uploaded folder.
      $this->remove_old_resumes();
  	}	
  public function create_job_application_entry() {
    //Before inserting to custom table check csrf token.
    $form_csrf_check = $this->check_csrf_token_jobapplication();
    if(!$form_csrf_check) {
        echo json_encode(array('status' => "200", 'message' => 'Invalid Access or Direct Access!'));
        exit;
    } 
  		$ja_pref_position = $this->convert_bp_array_to_string($this->EE->input->post("ja_pref_position"));
  		$ja_avail_day = $this->convert_bp_array_to_string($this->EE->input->post("ja_avail_day"));
  		$ja_avail_night = $this->convert_bp_array_to_string($this->EE->input->post("ja_avail_night"));
      //Get the resume filename if its uploaded.
      $resume_file_name = isset($_POST["field_id_140"]) ? $this->EE->input->post("field_id_140") : "";
      $jobapplication_data = array('ja_lang' =>$this->EE->input->post("ja_lang"), 'ja_type' =>$this->EE->input->post("ja_type"), 'ja_first_name' =>$this->EE->input->post("ja_first_name"), 'ja_last_name' =>$this->EE->input->post("ja_last_name"), 'ja_address' =>$this->EE->input->post("ja_address"), 'ja_city' =>$this->EE->input->post("ja_city"), 'ja_province' =>$this->EE->input->post("ja_province"), 'ja_postal_code' =>$this->EE->input->post("ja_postal_code"), 'ja_email_address' =>$this->EE->input->post("ja_email_address"), 'ja_phone' =>$this->EE->input->post("ja_phone"), 'ja_contact_tod' =>$this->EE->input->post("ja_contact_tod"), 'ja_legal_canada' =>$this->EE->input->post("ja_legal_canada"), 'ja_legal_alcohol' =>$this->EE->input->post("ja_legal_alcohol"), 'ja_legal_bondable' =>$this->EE->input->post("ja_legal_bondable"), 'ja_referrer' =>$this->EE->input->post("ja_referrer"), 'ja_pref_province' =>$this->EE->input->post("ja_pref_province"), 'ja_pref_city' =>$this->EE->input->post("ja_pref_city"), 'ja_pref_store' =>$this->EE->input->post("ja_pref_store"), 'ja_pref_position' =>$ja_pref_position, 'ja_avail_day' =>$ja_avail_day, 'ja_avail_night' =>$ja_avail_night, 'ja_avail_start' =>$this->EE->input->post("ja_avail_start"), 'ja_personal_why_bp' =>$this->EE->input->post("ja_personal_why_bp"), 'ja_personal_bp_mission' =>$this->EE->input->post("ja_personal_bp_mission"), 'ja_comments' =>$this->EE->input->post("ja_comments"), 'ja_resume' =>$resume_file_name);
        $jobapplication_query = $this->EE->db->insert_string('exp_custom_bp_jobapplication_details', $jobapplication_data); 
        $this->EE->db->query($jobapplication_query);
        $jobapplication_id = $this->EE->db->insert_id();
        $created_jobapplication_arr = $this->getCustomJobApplicationEntryById($jobapplication_id);
        //Seding email to store heads.
        new CustomJobApplicationMail($created_jobapplication_arr);
  }
  public function create_franchise_application_entry() {
    //Before inserting to custom table check csrf token.
    $form_csrf_check = $this->check_csrf_token_jobapplication();
    if(!$form_csrf_check) {
        echo json_encode(array('status' => "200", 'message' => 'Invalid Access or Direct Access!'));
        exit;
    }     
    $preferred_city = isset($_POST["fa_preferred_city"]) ? $this->EE->input->post("fa_preferred_city") : "";
    $fa_exp_employ_years = isset($_POST["fa_exp_employ_years"]) ? $this->EE->input->post("fa_exp_employ_years") : "";
    $fa_exp_employ_months = isset($_POST["fa_exp_employ_months"]) ? $this->EE->input->post("fa_exp_employ_months") : "";
    $fa_edu_school = isset($_POST["fa_edu_school"]) ? $this->EE->input->post("fa_edu_school") : "";
    $fa_edu_program = isset($_POST["fa_edu_program"]) ? $this->EE->input->post("fa_edu_program") : "";
    $franchise_application_data = array('fa_lang' =>$this->EE->input->post("fa_lang"), 'fa_type' =>$this->EE->input->post("fa_type"), 'fa_first_name' =>$this->EE->input->post("fa_first_name"), 'fa_last_name' =>$this->EE->input->post("fa_last_name"), 'fa_email_address' =>$this->EE->input->post("fa_email_address"), 'fa_address' =>$this->EE->input->post("fa_address"), 'fa_city' =>$this->EE->input->post("fa_city"), 'fa_province' =>$this->EE->input->post("fa_province"), 'fa_postal_code' =>$this->EE->input->post("fa_postal_code"), 'fa_phone' =>$this->EE->input->post("fa_phone"), 'fa_contact_tod' =>$this->EE->input->post("fa_contact_tod"), 'fa_exp_occupation' =>$this->EE->input->post("fa_exp_occupation"), 'fa_exp_employer' =>$this->EE->input->post("fa_exp_employer"), 'fa_exp_employ_years' =>$fa_exp_employ_years, 'fa_exp_employ_months' =>$fa_exp_employ_months, 'fa_edu_school' =>$this->EE->input->post("fa_edu_school"), 'fa_edu_program' =>$this->EE->input->post("fa_edu_program"), 'fa_investment_amount' =>$this->EE->input->post("fa_investment_amount"), 'fa_preferred_province' =>$this->EE->input->post("fa_preferred_province"), 'fa_preferred_city' =>$preferred_city, 'fa_referrer' =>$this->EE->input->post("fa_referrer"), 'fa_contact_opt_in' =>$this->EE->input->post("fa_contact_opt_in"));
    $franchise_application_query = $this->EE->db->insert_string('exp_custom_bp_franchiseapplication_details', $franchise_application_data); 
    $this->EE->db->query($franchise_application_query);
    $franchise_id = $this->EE->db->insert_id();
    $created_franchiseapplication_arr = $this->getCustomFranchiseApplicationEntryById($franchise_id);
    //Seding email to list of predefined boston manager group email ids.
    new FranchiseApplicationMail($created_franchiseapplication_arr);
  }
  public function convert_bp_array_to_string($arraydata) {
  		$bp_return_string = "";
  		if(is_array($arraydata)) {
  			$bp_return_string = implode(",",$arraydata);
  		}
  		return $bp_return_string;
  }
   public function getCustomJobApplicationEntryById($id) {
      // get all fields from the custom table to get process.
      $sql = "SELECT ja_lang, ja_type, ja_first_name, ja_last_name, ja_address, ja_city, ja_province, ja_postal_code, ja_email_address, ja_phone, ja_contact_tod,ja_legal_canada, ja_legal_alcohol, ja_legal_bondable, ja_referrer, ja_pref_province, ja_pref_city, ja_pref_store, ja_pref_position, ja_avail_day,ja_avail_night, ja_avail_start,ja_personal_why_bp, ja_personal_bp_mission, ja_comments, ja_resume, create_date FROM exp_custom_bp_jobapplication_details WHERE id=$id";
      $res = $this->EE->db->query($sql);
      $job_appliction_result = array();
      if($res->result_array()) {
        $job_appliction_arr = $res->result_array();
        $job_appliction_result = $job_appliction_arr[0];
      }
      return $job_appliction_result;
  }
   public function getCustomFranchiseApplicationEntryById($id) {
      // get all fields from the custom table to get process.
      $sql = "SELECT fa_lang, fa_type, fa_first_name, fa_last_name, fa_email_address, fa_address, fa_city, fa_province, fa_postal_code, fa_phone, fa_contact_tod, fa_exp_occupation, fa_exp_employer, fa_exp_employ_years, fa_exp_employ_months, fa_edu_school, fa_edu_program,fa_investment_amount, fa_preferred_province, fa_preferred_city, fa_referrer, fa_contact_opt_in FROM exp_custom_bp_franchiseapplication_details WHERE id=$id";
      $res = $this->EE->db->query($sql);
      $franchise_appliction_result = array();
      if($res->result_array()) {
        $franchise_appliction_arr = $res->result_array();
        $franchise_appliction_result = $franchise_appliction_arr[0];
      }
      return $franchise_appliction_result;
  }
  public function check_csrf_token_jobapplication() {
    $csrf_token_check_status = FALSE;
    $form_post_csrf_token = $_POST["ci_csrf_token"];
    $cookie_csrf_token = $_COOKIE["ci_csrf_token"];
      if($form_post_csrf_token == $cookie_csrf_token) {
          $csrf_token_check_status = TRUE;
      } else {
          $csrf_token_check_status = FALSE;
      }
      return $csrf_token_check_status;
  }

  public function remove_old_resumes() {
    $tenDaysOldDate = date('Y-m-d', strtotime('-10 day'));
    $fromDate = $tenDaysOldDate." 00:00:00";
    $toDate = $tenDaysOldDate." 23:59:59";
    $UPLOADED_RESUME_SERVER_PATH = $this->get_resume_upload_path();
    $sql = "SELECT id, ja_resume, create_date from exp_custom_bp_jobapplication_details WHERE (create_date > '".$fromDate."' AND create_date < '".$toDate."') AND ja_resume != ''";
    $result = $this->EE->db->query($sql);
    $totalCleanedResumes = 0;
    foreach ($result->result_array() as $row) {
        $resume_file_name = $row["ja_resume"];
        $full_path_file_name = $UPLOADED_RESUME_SERVER_PATH.$resume_file_name;
        if(file_exists($full_path_file_name)) {
            @unlink($full_path_file_name);
            $totalCleanedResumes++;
        }
    }
    //Send Notification Email to Devteam for reference.
    if($totalCleanedResumes > 0) {
      new JobApplicationCleanupEmail($totalCleanedResumes);
    }
  }
  public function get_resume_upload_path() {
    $sql = "SELECT id, server_path from exp_upload_prefs WHERE name = 'Job Applicants'";
    $result = $this->EE->db->query($sql);
    $resumeServerPath = "";
    foreach ($result->result_array() as $row) {
        $resumeServerPath = $row["server_path"];
    }
    return $resumeServerPath;
  }
}

/**This is a custom file developed to handle job application insert to custom table ***/

