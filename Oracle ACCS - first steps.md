# First Steps in ACCS
When you receive an email from Oracle informing you that your trial ACCS account has been created you should perform some initial steps to configure the service, before you can use it. This short tutorial is meant to help you in this initial configuration. Detailed instructions are well described in the Oracle ACCS [documentation](http://docs.oracle.com/cloud/latest/apaas_gs/index.html), please refer there in case of any doubts. Below you will find some most common tasks to be accomplished before starting the real adventure with Oracle ACCS:

#### Set your storage replication policy:
With an ACCS account you automatically get at least two other services: Oracle Storage Cloud Service and Oracle Developer Cloud Service. The former is meant to serve as a basic file system for all artifacts you may need to upload/download/read/write from within your service, such as archives, logs, data files etc. Although strictly speaking you don't need the storage for deploying the application (this can be done from the web console or from the DevCS), you need to set the replication policy, otherwise your deployments will fail. All details are described in the [Selecting a Replication Policy for Your Service Instance](http://docs.oracle.com/cloud/latest/storagecs_common/CSSTO/GUID-5D53C11F-3D9E-43E4-8D1D-DDBB95DEC715.htm#CSSTO-GUID-5D53C11F-3D9E-43E4-8D1D-DDBB95DEC715) section of the Oracle Cloud documentation, below are the main steps:

 Go to the Storage Service Console and select the **Set Replication Policy** option:
![Open the Set Replication Policy option][set_replication_policy_menu]

 When a list of available data center is displayed, pick a one:
![Choose the data center][set_replication_policy_pick_data_center]

 Confirm replication data center:
![Confirm the data center][set_replication_policy_confirm]

 Your replication policy has been set successfully:
![Set replication policy - success][set_replication_policy_success]

#### Creating an additional admin user

Once you activate your account a default user (with your email as a username) is created with all administration and functional privileges. However, sometimes you want to split the administration work or just create a user with just right permission for everyday work. The steps below allow you to add an additional admin user you can leverage to authenticate to your service. You will find detailed instruction [here](http://docs.oracle.com/en/cloud/get-started/subscriptions-cloud/csgsg/adding-users-and-assigning-roles.html#CSGSG166):

Go to **My Services->Users** and click the **Add** button:
![Add user dialog][new_admin_user_add_user]

Enter all required data (first name, last name, email and user name). In the **Roles** section make sure you select the **Service Instance Administrator** checkbox if you want to assign your new user an admin role. Then click **Add**.  
You will be redirected to the main user list. Select a hamburger icon next to you new user and choose **Reset Password / Unlock Account** to unlock a user and set a new password:
![Select Reset Password][new_admin_user_reset_password]

Confirm your action by clicking on the **Reset** button:
![Confirm Reset Password][new_admin_user_reset_password_confirm]

#### Typical Workflow for Administering Application
To learn about other most common administration tasks please refer to the following documentation page:

[Typical Workflow for Administering Application](http://docs.oracle.com/en/cloud/paas/app-container-cloud/csjse/typical-workflow-administering-applications.html)


[new_admin_user_add_user]: docs/images/accs_first_steps/new_admin_user_add_user.png
[new_admin_user_reset_password]: docs/images/accs_first_steps/new_admin_user_reset_password.png
[new_admin_user_reset_password_confirm]: docs/images/accs_first_steps/new_admin_user_reset_password_confirm.png
[set_replication_policy_confirm]: docs/images/accs_first_steps/set_replication_policy_confirm.png
[set_replication_policy_menu]: docs/images/accs_first_steps/set_replication_policy_menu.png
[set_replication_policy_pick_data_center]: docs/images/accs_first_steps/set_replication_policy_pick_data_center.png
[set_replication_policy_success]: docs/images/accs_first_steps/set_replication_policy_success.png


