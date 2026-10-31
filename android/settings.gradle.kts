rootProject.name = "SmartAgriInspector"
include(":data-processing")
include(":ui-components")
include(":api-communication")

project(":data-processing").projectDir = file("data-processing")
project(":ui-components").projectDir = file("ui-components")
project(":api-communication").projectDir = file("api-communication")
