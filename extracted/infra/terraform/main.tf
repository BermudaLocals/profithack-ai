// Terraform stub — fill with your chosen cloud (GCP/AWS/Azure)
terraform {
  required_version = ">= 1.5.0"
}

provider "google" {
  project = var.project_id
  region  = var.region
}

variable "project_id" {}
variable "region" { default = "us-central1" }

output "next_steps" {
  value = "Create GKE cluster, Cloud SQL, Redis, and S3-compatible bucket."
}
