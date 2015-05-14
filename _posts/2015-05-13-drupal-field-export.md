---
layout: post
title:  "Exporting Drupal Node Fields"
date:   2015-05-13 15:21:00
categories: drupal
---

It is a good idea to build content_types in code, especially if you're working with version control and multipule environments.  Building out the fields and all that stuff can sometimes be a true pain in the ass though.

So, like with views, it may be eaiser to build it out in the GUI in your local, then export the fields and put them in your code.  So here's how to do that.

First make sure you have [devel](https://www.drupal.org/project/devel "devel") installed.  Now go to the devel PHP page.  This will be http://local.url/devel/php and paste in some code. **DO NOT INCLUDE PHP TAGS IF YOU'RE COPY/PASTING THIS FROM HERE**

{% highlight php %}
<?php

$entity_type = '';
$field_name = 'field_';
$bundle_name = '';

$info_config = field_info_field($field_name);
$info_instance = field_info_instance($entity_type, $field_name, $bundle_name);
unset($info_config['id']);
unset($info_instance['id'], $info_instance['field_id']);

include_once DRUPAL_ROOT . '/includes/utility.inc';

$info = drupal_var_export($info_config);
$instance .= drupal_var_export($info_instance);

print_r($info);
//print_r($instance);

{% endhighlight %}

Then just set the top three vars.  

{% highlight php %}
<?php

$entity_type = 'node';
$field_name = 'field_example';
$bundle_name = 'example';

{% endhighlight %}

The last two lines will dictate which array gets exported.  Uncomments the instance line and comment out the info line to show the instance vs. the info.  Now, because I'm writing this as a placeholder reminder for when I need to use it, I'm going to use this example to add fields to an *existing* content_type.  This also assumes that the content_type has a module to handle it's initial configuration.  Go to the install file and add an update function. Add the export from the info to a field variable and then run field_create_field with that field variable.  Next do the same for instance but use field_create_instance.

{% highlight php %}
<?php

function example_module_update_7100() {
  $field = array(
    'translatable' => '0',
    'entity_types' => array(),
    'settings' => array(
      'max_length' => '255',
    ),
    'storage' => array(
      'type' => 'field_sql_storage',
      'settings' => array(),
      'module' => 'field_sql_storage',
      'active' => '1',
      'details' => array(
        'sql' => array(
          'FIELD_LOAD_CURRENT' => array(
            'field_data_field_example' => array(
              'value' => 'field_example_value',
              'format' => 'field_example_format',
            ),
          ),
          'FIELD_LOAD_REVISION' => array(
            'field_revision_field_example' => array(
              'value' => 'field_example_value',
              'format' => 'field_example_format',
            ),
          ),
        ),
      ),
    ),
    'foreign keys' => array(
      'format' => array(
        'table' => 'filter_format',
        'columns' => array(
          'format' => 'format',
        ),
      ),
    ),
    'indexes' => array(
      'format' => array(
        'format',
      ),
    ),
    'field_name' => 'field_example',
    'type' => 'text',
    'module' => 'text',
    'active' => '1',
    'locked' => '0',
    'cardinality' => '1',
    'deleted' => '0',
    'columns' => array(
      'value' => array(
        'type' => 'varchar',
        'length' => '255',
        'not null' => FALSE,
      ),
      'format' => array(
        'type' => 'varchar',
        'length' => 255,
        'not null' => FALSE,
      ),
    ),
    'bundles' => array(
      'node' => array(
        'event',
      ),
    ),
  );

  field_create_field($field);
  
  $instance = array(
    'label' => 'Example',
    'widget' => array(
      'weight' => '16',
      'type' => 'text_textfield',
      'module' => 'text',
      'active' => 1,
      'settings' => array(
        'size' => '60',
        'maxlength_js' => 0,
        'maxlength_js_label' => 'Content limited to @limit characters, remaining: <strong>@remaining</strong>',
      ),
    ),
    'settings' => array(
      'text_processing' => '0',
      'user_register_form' => FALSE,
    ),
    'display' => array(
      'default' => array(
        'label' => 'above',
        'type' => 'text_default',
        'settings' => array(),
        'module' => 'text',
        'weight' => 10,
      ),
      'full' => array(
        'type' => 'hidden',
        'label' => 'above',
        'settings' => array(),
        'weight' => 0,
      ),
      'teaser' => array(
        'type' => 'hidden',
        'label' => 'above',
        'settings' => array(),
        'weight' => 0,
      ),
    ),
    'required' => 0,
    'description' => 'This is an example.',
    'default_value' => NULL,
    'field_name' => 'field_example',
    'entity_type' => 'node',
    'bundle' => 'example',
    'deleted' => '0',
  );

  field_create_instance($instance);
}

{% endhighlight %}

And that's pretty much it.  On your local restore a sql-dump from before you added the field via the GUI and then run drush updatedb.  After that, assuming it's all good, then push to your other environments and updatedb.  Enjoy you're new field. 
