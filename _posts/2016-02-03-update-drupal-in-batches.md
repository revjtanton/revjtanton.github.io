---
layout: post
title:  "Update Drupal in Batches"
date:   2016-02-03 10:30:00
categories: drupal
tags: [hook_update, batch processing]
---
Recently during a deployment we kept hitting deadlocks.  The reason for the deadlocks was that too many nodes were being updated during updatedb at once.  To avoid this problem we needed to find a way to run those updates in batches instead of all together.  It turns out there is an argument to hook_update() called $sandbox.  $sandbox is passed-by-reference so that it will be remembered over itterations.  Using this we can limit how many nodes are updated over a pass, and avoid bottlenecks.  Here is an example:

{% highlight php %} 
<?php 
/**
 * Implements a test update.
 */
function example_update_7000(&$sandbox) {
  if (!isset($sandbox['total'])) {
    $result = db_query('SELECT nid FROM {node} WHERE type = :type', array(':type' => 'example'));
    $sandbox['total'] = $result->rowCount();
    $sandbox['current'] = 0;
  }

  $nodes_per_pass = 10;
  $result = db_query_range('SELECT nid FROM {node} WHERE type= :type', $sandbox['current'], $nodes_per_pass, array(':type' => 'example'));

  while ($row = $result->fetchAssoc()) {
    $node = node_load($row['nid']);
    $wrapper = entity_metadata_wrapper('node', $node);

    try{
      $wrapper->field_button_color->value();
    } catch (Exception $e) {
      $sandbox['current']++;
      continue;
    }

    if($wrapper->field_example_field->value() == false) {
      $wrapper->field_example_field->set('example');
      $wrapper->save();
    }

    $sandbox['current']++;
  }

  $sandbox['#finished'] = ($sandbox['current'] / $sandbox['total']);

  if ($sandbox['#finished'] === 1) {
    drupal_set_message(t('We processed @nodes nodes. DONE!!!', array('@nodes' => $sandbox['total'])));
  }
}
?>
{% endhighlight %}