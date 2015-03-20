<?php
    //Check the session value is exist or not.
    //If invalid login present redirect to login page.
    require_once(PATH_THIRD."adminbpform/admin-jobapplication-header.php");
    require_once(PATH_THIRD."adminbpform/pi.adminbpform.php");

    $adminbpform = new Adminbpform();

    $adminbpform->admin_jobapplication_header();

    // //If logout function called page will be redirected to admin login page.
    if($this->EE->uri->segment(3) == "logout") {
        $adminbpform->admin_jobapplication_logout();
        exit;
    } 

    //Before displaying the list of application need to check session is valid.
    if ($this->EE->bp_session->userdata('adminjobuserlogin')) {

        //check for segment if "view" present we need to show the particular job application details view/id.
        //Else we need to show all jobapplication details in the grid.
        if($this->EE->uri->segment(3) == "view") {
          $jobapp_segment_str = $this->EE->uri->segment(4);
          $jobapp_id_arr = explode("_", $jobapp_segment_str);
          $application_id = isset($jobapp_id_arr[1]) ? $jobapp_id_arr[1] : 0;

          //check the URI segment first part.
              if($jobapp_id_arr[0] == "jobreq") {
                  //Call job application details function to display particular job application detail.
                  $adminbpform->admin_get_jobapplication_details_ById($application_id);
             } else if ($jobapp_id_arr[0] == "franchreq") {
                  //Call job application details function to display particular job application detail.
                  $adminbpform->admin_get_franchiseapplication_details_ById($application_id);

             }

        } else {
             //Display list of applications received.
            $display_per_page = CONST_ADMIN_COUNT_PER_PAGE;
            $req_page = isset($_GET['page']) ? $_GET['page'] : 1;
            $start_offset = ($req_page > 1) ? ($req_page * $display_per_page) - $display_per_page : 0;
            $end_limit = $display_per_page;      


            //Call the specific function based on the display need.  
            $adminbpform->admin_display_search_form();

            //Get the number of rows present in the db to calculate total rows.
            $criteriaArr = array();
            if(isset($_POST['search-submit'])) {
                $criteriaArr['admin_search_ja_type'] = $_POST['sel-jobapplication-type'];
                $criteriaArr['admin_search_ja_lang'] = $_POST['sel-language'];
                $this->EE->bp_session->set_userdata('admin_search_ja_type', $_POST['sel-jobapplication-type']);
                $this->EE->bp_session->set_userdata('admin_search_ja_lang', $_POST['sel-language']);
            } else if($this->EE->bp_session->userdata('admin_search_ja_type') && $this->EE->bp_session->userdata('admin_search_ja_lang')) {
                $criteriaArr['admin_search_ja_type'] = $this->EE->bp_session->userdata('admin_search_ja_type');
                $criteriaArr['admin_search_ja_lang'] = $this->EE->bp_session->userdata('admin_search_ja_lang');
            } else {
                $criteriaArr['admin_search_ja_type'] = '1';
                $criteriaArr['admin_search_ja_lang'] = 'en';
            }

            //For simplify the search form we have assigned 3 & 4 value for franchise applications.
            //Then we reassign them 1 & 2 for db queries to lookup right value.
            if($this->EE->bp_session->userdata('admin_search_ja_type') == 3)
                $criteriaArr['admin_search_ja_type'] = 1;
            if($this->EE->bp_session->userdata('admin_search_ja_type') == 4)
                $criteriaArr['admin_search_ja_type'] = 2;

            //Call the respective funtion based on the criteria.
            //if 3 & 4 are submiitted - search should go to "exp_custom_bp_franchiseapplication_details" table.
            if($this->EE->bp_session->userdata('admin_search_ja_type') == 1 || $this->EE->bp_session->userdata('admin_search_ja_type') == 2)
            {
                $total_db_rows = $adminbpform->get_total_rows_count_jobapplications($criteriaArr);
                $adminbpform->admin_list_jobapplications($criteriaArr, $start_offset, $end_limit);
            }
            else 
            {   
                $total_db_rows = $adminbpform->get_total_rows_count_franchiseapplications($criteriaArr);
                $adminbpform->admin_list_franchiseapplications($criteriaArr, $start_offset, $end_limit);
            }
        
            // Pageination string display code
            $page = isset($_GET['page']) ? ((int) $_GET['page']) : 1;
            $pagination = (new Pagination());
            $pagination->setCurrent($page);
            $pagination->setTotal($total_db_rows);
            $markup = $pagination->parse();
            echo $markup;
           
        }
    } else {
        echo "Invalid Access... Please login!";
    }
    require_once(PATH_THIRD."adminbpform/admin-jobapplication-footer.php");
?>

